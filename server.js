require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : '';
const SITE_URL = (process.env.SITE_URL || RENDER_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX !== 'false';
const SSL_BASE = IS_SANDBOX ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com';
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || (IS_SANDBOX ? 'testbox' : '');
const STORE_PASS = process.env.SSLCOMMERZ_STORE_PASSWD || (IS_SANDBOX ? 'qwerty' : '');
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '8801516567622';

const PRODUCTS = Object.freeze({
  fresh_250g: { name: 'Oyster Mushroom 250g', price: 150 },
  fresh_500g: { name: 'Oyster Mushroom 500g', price: 280 },
  fresh_1kg: { name: 'Oyster Mushroom 1kg', price: 520 },
  dried_50g: { name: 'Dried Mushroom 50g', price: 200 },
});
const DELIVERY = Object.freeze({
  dhaka_city: { name: 'Dhaka City', fee: 60 },
  dhaka_metro: { name: 'Dhaka Metro', fee: 100 },
  outside_dhaka: { name: 'Outside Dhaka', fee: 130 },
  remote: { name: 'Remote Area', fee: 180 },
});
const GATEWAYS = Object.freeze({
  bkash: 'bkash',
  nagad: 'nagad',
  card: 'visacard,mastercard,amexcard',
  cod: 'cod',
});
const pendingOrders = new Map();
const completedOrders = new Map();

if (!STORE_ID || !STORE_PASS) {
  throw new Error('SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWD are required in live mode.');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

function cleanText(value, maxLength) {
  return String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, maxLength);
}

function makeTranId() {
  return `MW${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function totalsFor(productId, rawQty, areaId) {
  const product = PRODUCTS[productId];
  const delivery = DELIVERY[areaId];
  const qty = Number(rawQty);
  if (!product || !delivery || !Number.isInteger(qty) || qty < 1 || qty > 99) return null;
  const subtotal = product.price * qty;
  return { product, delivery, qty, subtotal, shipping: delivery.fee, total: subtotal + delivery.fee };
}

function makeWhatsAppUrl(order, paymentStatus) {
  const lines = [
    'New Order — Mushroom Wonders',
    `Payment: ${paymentStatus}`,
    `Order reference: ${order.transactionId}`,
    `Name: ${order.name}`,
    `Mobile: ${order.phone}`,
    `Product: ${order.productName}`,
    `Quantity: ${order.qty}`,
    `Items: ৳${order.subtotal}`,
    `Delivery: ৳${order.shipping} (${order.areaName})`,
    `Total: ৳${order.total}`,
    `Address: ${order.address}`,
  ];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Remote service returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function sslCommerzInit(payload) {
  return fetchJson(`${SSL_BASE}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  });
}

async function sslCommerzValidate(valId) {
  const query = new URLSearchParams({ val_id: valId, store_id: STORE_ID, store_passwd: STORE_PASS, format: 'json' });
  return fetchJson(`${SSL_BASE}/validator/api/validationserverAPI.php?${query}`);
}

function validationMatchesOrder(validation, transactionId, order) {
  const validStatus = validation.status === 'VALID' || validation.status === 'VALIDATED';
  const validAmount = Math.abs(Number(validation.amount) - order.total) < 0.01;
  return validStatus && validation.tran_id === transactionId && validation.currency === 'BDT' && validAmount;
}

async function confirmGatewayPayment({ tranId, valId }) {
  const alreadyCompleted = completedOrders.get(tranId);
  if (alreadyCompleted) return { ok: true, order: alreadyCompleted.order, validation: alreadyCompleted.validation };
  const order = pendingOrders.get(tranId);
  if (!order || !valId) return { ok: false, reason: 'order' };
  const validation = await sslCommerzValidate(valId);
  if (!validationMatchesOrder(validation, tranId, order)) return { ok: false, reason: 'validation' };
  if (String(validation.risk_level) === '1') return { ok: false, reason: 'risk' };
  order.status = 'paid';
  order.validation = {
    bankTransactionId: validation.bank_tran_id,
    cardType: validation.card_type,
    validatedOn: validation.validated_on,
  };
  completedOrders.set(tranId, { order, validation, completedAt: Date.now() });
  pendingOrders.delete(tranId);
  return { ok: true, order, validation };
}

app.post('/api/init-payment', async (req, res) => {
  const name = cleanText(req.body.name, 50);
  const phone = cleanText(req.body.phone, 11);
  const address = cleanText(req.body.address, 180);
  const paymentMethod = cleanText(req.body.paymentMethod, 10);
  const calculated = totalsFor(req.body.product, req.body.qty, req.body.area);

  if (!name || !/^01[3-9]\d{8}$/.test(phone) || !address || !calculated || !GATEWAYS[paymentMethod]) {
    return res.status(400).json({ error: 'Please check the order information and try again.' });
  }

  const transactionId = makeTranId();
  const order = {
    transactionId,
    name,
    phone,
    address,
    productId: req.body.product,
    productName: calculated.product.name,
    qty: calculated.qty,
    area: req.body.area,
    areaName: calculated.delivery.name,
    subtotal: calculated.subtotal,
    shipping: calculated.shipping,
    total: calculated.total,
    paymentMethod,
    location: req.body.location || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (paymentMethod === 'cod') {
    order.status = 'cash_on_delivery';
    return res.json({ cod: true, tranId: transactionId, whatsappUrl: makeWhatsAppUrl(order, 'Cash on Delivery') });
  }

  pendingOrders.set(transactionId, order);

  try {
    const result = await sslCommerzInit({
      store_id: STORE_ID,
      store_passwd: STORE_PASS,
      total_amount: calculated.total.toFixed(2),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${SITE_URL}/api/payment-success`,
      fail_url: `${SITE_URL}/api/payment-fail`,
      cancel_url: `${SITE_URL}/api/payment-cancel`,
      ipn_url: `${SITE_URL}/api/payment-ipn`,
      cus_name: name,
      cus_email: 'order@mushroomwonders.bd',
      cus_add1: address.slice(0, 120),
      cus_phone: phone,
      cus_city: calculated.delivery.name,
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      product_name: `${calculated.product.name} x${calculated.qty}`,
      product_category: 'Food',
      product_profile: 'general',
      multi_card_name: GATEWAYS[paymentMethod],
      value_a: transactionId,
    });
    if (result.status === 'SUCCESS' && result.GatewayPageURL) {
      return res.json({ gatewayUrl: result.GatewayPageURL, tranId: transactionId });
    }
    pendingOrders.delete(transactionId);
    return res.status(502).json({ error: result.failedreason || 'Payment gateway is temporarily unavailable.' });
  } catch (error) {
    pendingOrders.delete(transactionId);
    console.error('init-payment:', error.message);
    return res.status(502).json({ error: 'Could not connect to the payment gateway. Please try again.' });
  }
});

async function paymentSuccess(req, res) {
  const tranId = cleanText(req.body.tran_id || req.query.tran_id, 50);
  const valId = cleanText(req.body.val_id || req.query.val_id, 80);
  try {
    const result = await confirmGatewayPayment({ tranId, valId });
    if (!result.ok) return res.redirect(`/payment-fail.html?reason=${encodeURIComponent(result.reason)}`);
    const query = new URLSearchParams({
      tran_id: tranId,
      amount: result.order.total.toFixed(2),
      product: result.order.productName,
      whatsapp: makeWhatsAppUrl(result.order, 'Paid Online'),
    });
    return res.redirect(`/payment-success.html?${query}`);
  } catch (error) {
    console.error('payment-success:', error.message);
    return res.redirect('/payment-fail.html?reason=validation');
  }
}
app.post('/api/payment-success', paymentSuccess);
app.get('/api/payment-success', paymentSuccess);

function paymentNotCompleted(req, res) {
  const tranId = cleanText(req.body.tran_id || req.query.tran_id, 50);
  if (tranId) pendingOrders.delete(tranId);
  const reason = req.path.endsWith('cancel') ? 'cancelled' : 'failed';
  return res.redirect(`/payment-fail.html?reason=${reason}`);
}
app.post('/api/payment-fail', paymentNotCompleted);
app.get('/api/payment-fail', paymentNotCompleted);
app.post('/api/payment-cancel', paymentNotCompleted);
app.get('/api/payment-cancel', paymentNotCompleted);

app.post('/api/payment-ipn', async (req, res) => {
  const tranId = cleanText(req.body.tran_id, 50);
  const valId = cleanText(req.body.val_id, 80);
  try {
    const result = await confirmGatewayPayment({ tranId, valId });
    return res.status(result.ok ? 200 : 400).send(result.ok ? 'OK' : 'INVALID');
  } catch (error) {
    console.error('payment-ipn:', error.message);
    return res.status(502).send('RETRY');
  }
});

app.get('/api/reverse-geocode', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const language = req.query.lang === 'en' ? 'en' : 'bn';
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  try {
    const query = new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'jsonv2', addressdetails: '1', 'accept-language': language });
    const data = await fetchJson(`https://nominatim.openstreetmap.org/reverse?${query}`, {
      headers: { 'User-Agent': 'MushroomWonders/1.0 (order@mushroomwonders.bd)', Accept: 'application/json' },
    });
    const details = data.address || {};
    const readableParts = [
      details.house_number,
      details.road || details.pedestrian,
      details.neighbourhood || details.quarter,
      details.suburb,
      details.city_district,
      details.city || details.town || details.village || details.municipality,
      details.county,
      details.state,
      details.country,
    ].filter((part, index, parts) => part && parts.indexOf(part) === index);
    res.set('Cache-Control', 'public, max-age=3600');
    return res.json({ address: readableParts.join(', ') || data.name || '' });
  } catch (error) {
    console.error('reverse-geocode:', error.message);
    return res.status(502).json({ error: 'Address lookup unavailable' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, paymentMode: IS_SANDBOX ? 'sandbox' : 'live' });
});

setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  for (const [id, order] of pendingOrders) {
    if (Date.parse(order.createdAt) < cutoff) pendingOrders.delete(id);
  }
  for (const [id, record] of completedOrders) {
    if (record.completedAt < cutoff) completedOrders.delete(id);
  }
}, 60 * 60 * 1000).unref();

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mushroom Wonders running at ${SITE_URL}`);
  console.log(`Payment mode: SSLCommerz ${IS_SANDBOX ? 'SANDBOX' : 'LIVE'}`);
});
