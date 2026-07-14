/* Checkout wizard, map picker and hosted payment hand-off. */
(function () {
  const deliveryFees = { dhaka_city: 60, dhaka_metro: 100, outside_dhaka: 130, remote: 180 };
  const WHATSAPP = '8801516567622';
  let currentStep = 1;
  let map;
  let marker;
  let selectedLatLng = null;
  let selectedAddress = '';

  const byId = (id) => document.getElementById(id);
  const orderForm = byId('orderForm');
  if (!orderForm) return;

  const productEl = byId('product');
  const qtyEl = byId('qty');
  const areaEl = byId('area');
  const subtotalEl = byId('subtotal');
  const shippingEl = byId('shipping');
  const totalEl = byId('total');
  const sumProduct = byId('sumProduct');
  const sumQty = byId('sumQty');
  const sumArea = byId('sumArea');
  const btnNext = byId('btnNext');
  const btnBack = byId('btnBack');
  const btnPay = byId('btnPay');
  const payOverlay = byId('payOverlay');
  const payOverlayText = byId('payOverlayText');
  const orderStatus = byId('orderStatus');
  const mapStatus = byId('mapStatus');
  const mapContainer = byId('mapContainer');
  const fullscreenMapBtn = byId('fullscreenMapBtn');

  function lang() {
    return document.documentElement.getAttribute('data-lang') || 'bn';
  }

  function t(key) {
    return (typeof i18n !== 'undefined' && i18n[lang()] ? i18n[lang()][key] : null) || key;
  }

  function localNumber(value) {
    return value.toLocaleString(lang() === 'en' ? 'en-US' : 'bn-BD');
  }

  function setStatus(message, focus = false) {
    if (!orderStatus) return;
    orderStatus.textContent = message;
    orderStatus.hidden = !message;
    if (focus && message) orderStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function getSelectedProduct() {
    const radio = document.querySelector('input[name="productRadio"]:checked');
    if (!radio) return { id: '', label: '', price: 0 };
    const card = radio.closest('.product-card');
    const name = card?.querySelector('.product-card__name')?.textContent.trim() || radio.value;
    const size = card?.querySelector('.product-card__size')?.textContent.trim() || '';
    return { id: radio.value, label: `${name} ${size}`.trim(), price: Number(radio.dataset.price || 0) };
  }

  function syncProductSelect() {
    productEl.value = getSelectedProduct().id;
  }

  function calcTotals() {
    const product = getSelectedProduct();
    const qty = Math.min(99, Math.max(1, Number(qtyEl.value || 1)));
    const subtotal = product.price * qty;
    const shipping = deliveryFees[areaEl.value] || 0;
    const total = subtotal + shipping;

    subtotalEl.textContent = localNumber(subtotal);
    shippingEl.textContent = localNumber(shipping);
    totalEl.textContent = localNumber(total);
    sumProduct.textContent = product.label || '—';
    sumQty.textContent = localNumber(qty);
    sumArea.textContent = areaEl.value ? areaEl.options[areaEl.selectedIndex].text.split('—')[0].trim() : '—';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'bkash';
    btnPay.textContent = paymentMethod === 'cod'
      ? t('btn_cod_short')
      : `৳${localNumber(total)} — ${t('btn_pay_short')}`;
    return { subtotal, shipping, total, product, qty };
  }

  function showStep(step, moveFocus = true) {
    currentStep = Math.min(3, Math.max(1, step));
    document.querySelectorAll('.order-panel').forEach((panel) => {
      const visible = Number(panel.dataset.panel) === currentStep;
      panel.hidden = !visible;
      panel.classList.toggle('is-visible', visible);
    });
    document.querySelectorAll('.order-step').forEach((item) => {
      const number = Number(item.dataset.step);
      item.classList.toggle('is-active', number === currentStep);
      item.classList.toggle('is-done', number < currentStep);
      if (number === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    btnBack.hidden = currentStep === 1;
    btnNext.hidden = currentStep === 3;
    btnPay.hidden = currentStep !== 3;
    setStatus('');
    if (moveFocus) document.querySelector(`[data-panel="${currentStep}"] .order-panel__title`)?.focus?.({ preventScroll: true });
  }

  function validationError(message, field) {
    setStatus(message, true);
    field?.focus();
    return false;
  }

  function validateStep(step) {
    const nameEl = byId('name');
    const phoneEl = byId('phone');
    const addressEl = byId('address');
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();

    if (step === 1) {
      if (!name) return validationError(t('err_name'), nameEl);
      if (!/^01[3-9]\d{8}$/.test(phone)) return validationError(t('err_phone'), phoneEl);
      if (!getSelectedProduct().id) return validationError(t('err_product'), document.querySelector('input[name="productRadio"]'));
      if (!qtyEl.value || Number(qtyEl.value) < 1 || Number(qtyEl.value) > 99) return validationError(t('err_qty'), qtyEl);
      syncProductSelect();
    }
    if (step === 2) {
      if (!areaEl.value) return validationError(t('err_area'), areaEl);
      if (!addressEl.value.trim()) return validationError(t('err_address'), addressEl);
    }
    setStatus('');
    calcTotals();
    return true;
  }

  function getOrderData() {
    const calculated = calcTotals();
    return {
      name: byId('name').value.trim(),
      phone: byId('phone').value.trim(),
      product: calculated.product.id,
      qty: calculated.qty,
      area: areaEl.value,
      address: byId('address').value.trim(),
      location: selectedLatLng ? { lat: selectedLatLng.lat, lng: selectedLatLng.lng } : null,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'bkash',
    };
  }

  function makeWhatsAppUrl(order, calculated, paymentStatus, transactionId = '') {
    const areaLabel = areaEl.options[areaEl.selectedIndex].text;
    const lines = [
      'New Order — Mushroom Wonders',
      `Payment: ${paymentStatus}`,
      transactionId ? `Order reference: ${transactionId}` : '',
      `Name: ${order.name}`,
      `Mobile: ${order.phone}`,
      `Product: ${calculated.product.label}`,
      `Quantity: ${order.qty}`,
      `Items: ৳${calculated.subtotal}`,
      `Delivery: ৳${calculated.shipping} (${areaLabel})`,
      `Total: ৳${calculated.total}`,
      `Address: ${order.address}`,
    ].filter(Boolean);
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  function savePendingOrder(order, calculated, transactionId = '') {
    try {
      sessionStorage.setItem('mw-pending-order', JSON.stringify({
        ...order,
        transactionId,
        productLabel: calculated.product.label,
        areaLabel: areaEl.options[areaEl.selectedIndex].text,
        subtotal: calculated.subtotal,
        shipping: calculated.shipping,
        total: calculated.total,
      }));
    } catch (_) {}
  }

  function validateCheckout() {
    showStep(1, false);
    if (!validateStep(1)) return false;
    showStep(2, false);
    if (!validateStep(2)) return false;
    showStep(3, false);
    return true;
  }

  async function initiatePayment() {
    if (!validateCheckout()) return;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'bkash';
    const order = getOrderData();
    const calculated = calcTotals();
    if (paymentMethod === 'cod') {
      window.location.assign(makeWhatsAppUrl(order, calculated, 'Cash on Delivery'));
      return;
    }
    if (window.location.protocol === 'file:') {
      setStatus(t('err_file_mode'), true);
      return;
    }
    savePendingOrder(order, calculated);
    payOverlayText.textContent = t(paymentMethod === 'cod' ? 'cod_redirecting' : 'pay_redirecting');
    payOverlay.hidden = false;
    btnPay.disabled = true;
    try {
      const healthResponse = await fetch('/api/health', { cache: 'no-store' });
      const health = await healthResponse.json().catch(() => null);
      if (!healthResponse.ok || !health?.ok) throw new Error(t('err_server'));
      const response = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t('err_payment'));
      if (data.whatsappUrl) {
        window.location.assign(data.whatsappUrl);
        return;
      }
      if (!data.gatewayUrl) throw new Error(data.error || t('err_payment'));
      savePendingOrder(order, calculated, data.tranId || '');
      window.location.assign(data.gatewayUrl);
    } catch (error) {
      payOverlay.hidden = true;
      btnPay.disabled = false;
      setStatus(error instanceof TypeError ? t('err_server') : (error.message || t('err_server')), true);
    }
  }

  async function reverseGeocode(lat, lng) {
    mapStatus.textContent = t('map_loading');
    try {
      const params = new URLSearchParams({ lat, lng, lang: lang() });
      const response = await fetch(`/api/reverse-geocode?${params}`);
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      return String(data.address || '').trim();
    } catch (_) {
      return '';
    }
  }

  async function updateMarkerPosition(latlng, center = false) {
    selectedLatLng = latlng;
    marker.setLatLng(latlng);
    if (center) map.setView(latlng, 16);
    selectedAddress = await reverseGeocode(latlng.lat, latlng.lng);
    mapStatus.textContent = selectedAddress ? `${t('map_ready')} ${selectedAddress}` : t('map_name_required');
  }

  function setMapFullscreen(enabled) {
    mapContainer.classList.toggle('is-fullscreen', enabled);
    document.body.classList.toggle('map-fullscreen-open', enabled);
    fullscreenMapBtn.setAttribute('aria-pressed', String(enabled));
    fullscreenMapBtn.textContent = t(enabled ? 'btn_exit_fullscreen' : 'btn_fullscreen');
    setTimeout(() => map?.invalidateSize(), 50);
  }

  function initMap() {
    if (map) return true;
    if (!window.L) {
      setStatus(t('err_map'), true);
      return false;
    }
    const dhaka = [23.8103, 90.4125];
    map = L.map('map', { scrollWheelZoom: false }).setView(dhaka, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    marker = L.marker(dhaka, { draggable: true }).addTo(map);
    marker.on('dragend', () => updateMarkerPosition(marker.getLatLng()));
    map.on('click', (event) => updateMarkerPosition(event.latlng));
    return true;
  }

  document.querySelectorAll('input[name="productRadio"]').forEach((radio) => radio.addEventListener('change', () => {
    syncProductSelect();
    calcTotals();
  }));
  byId('qtyMinus').addEventListener('click', () => { qtyEl.value = Math.max(1, Number(qtyEl.value) - 1); calcTotals(); });
  byId('qtyPlus').addEventListener('click', () => { qtyEl.value = Math.min(99, Number(qtyEl.value) + 1); calcTotals(); });
  qtyEl.addEventListener('input', calcTotals);
  areaEl.addEventListener('change', calcTotals);
  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => radio.addEventListener('change', calcTotals));
  orderForm.addEventListener('submit', (event) => event.preventDefault());
  btnNext.addEventListener('click', () => { if (validateStep(currentStep)) showStep(currentStep + 1); });
  btnBack.addEventListener('click', () => showStep(currentStep - 1));
  btnPay.addEventListener('click', initiatePayment);

  byId('openMapBtn').addEventListener('click', () => {
    mapContainer.hidden = false;
    if (initMap()) setTimeout(() => map.invalidateSize(), 50);
  });
  byId('closeMapBtn').addEventListener('click', () => {
    setMapFullscreen(false);
    mapContainer.hidden = true;
  });
  fullscreenMapBtn.addEventListener('click', () => setMapFullscreen(!mapContainer.classList.contains('is-fullscreen')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mapContainer.classList.contains('is-fullscreen')) setMapFullscreen(false);
  });
  byId('confirmLocationBtn').addEventListener('click', () => {
    if (!selectedAddress) {
      mapStatus.textContent = t('map_name_required');
      return;
    }
    byId('address').value = selectedAddress;
    setMapFullscreen(false);
    mapContainer.hidden = true;
    setStatus('');
  });
  byId('myLocationBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return setStatus(t('err_location'), true);
    mapStatus.textContent = t('map_loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => updateMarkerPosition(L.latLng(coords.latitude, coords.longitude), true),
      () => { mapStatus.textContent = ''; setStatus(t('err_location'), true); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });

  document.addEventListener('mw:languagechange', () => {
    calcTotals();
    if (mapContainer.classList.contains('is-fullscreen')) fullscreenMapBtn.textContent = t('btn_exit_fullscreen');
  });
  showStep(1, false);
  calcTotals();
})();
