# Mushroom Wonders

A bilingual English and Bangla website for an organic oyster mushroom business in Bangladesh.

**Live demo:** [mushroom-wonders.onrender.com](https://mushroom-wonders.onrender.com)

## Features

- Separate Home, Gallery, Storage, Recipes, and Order pages
- English-first language support with a Bangla toggle
- Responsive three-step checkout
- Product selection, quantity controls, delivery fees, and live order totals
- Interactive OpenStreetMap location picker with fullscreen view
- Readable address lookup from a selected map location
- Cash on Delivery confirmation through WhatsApp
- SSLCommerz sandbox integration for bKash, Nagad, and bank cards
- Server-side product and delivery-price validation
- Payment validation, IPN handling, and risk checks
- Automatic WhatsApp order confirmation after a successful online payment
- Free bilingual FAQ chatbot with typo-tolerant matching and verified safety sources
- Draggable floating chat button with quick questions and WhatsApp fallback

## Order flow

### Cash on Delivery

1. The customer enters their information and delivery address.
2. The customer selects **Cash on Delivery**.
3. The website opens WhatsApp with the complete order information.
4. The customer presses **Send** to confirm the order.

### Online payment

1. The customer selects bKash, Nagad, or a bank card.
2. The server creates a secure SSLCommerz payment session.
3. SSLCommerz processes and validates the payment.
4. The success page displays a five-second countdown.
5. WhatsApp opens with the order details, paid status, and transaction reference.
6. The customer presses **Send** to deliver the order confirmation.

> WhatsApp does not allow websites to send messages silently. The customer must press **Send** in WhatsApp.

## Technology

- HTML, CSS, and JavaScript
- Node.js and Express
- Leaflet and OpenStreetMap
- Nominatim reverse geocoding
- SSLCommerz payment gateway
- WhatsApp click-to-chat
- Render deployment

## Project structure

```text
Mushroom-wonders/
├── public/                 # Browser-facing website
│   ├── index.html
│   ├── gallery.html
│   ├── storage.html
│   ├── recipes.html
│   ├── order.html
│   ├── payment-success.html
│   ├── payment-fail.html
│   └── assets/
│       ├── css/            # Shared site styles
│       ├── js/             # Shared, chatbot, checkout, and payment scripts
│       └── images/         # Product and gallery images
├── server.js               # Express API and payment integration
├── package.json            # Node.js scripts and dependencies
├── render.yaml             # Render deployment blueprint
├── .env.example            # Environment-variable template
└── start-site.cmd          # Windows local launcher
```

## Run locally

Node.js 18 or newer is required.

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

On Windows, the included launcher can also be used:

```powershell
.\start-site.cmd
```

## Environment variables

Copy `.env.example` to `.env` and configure:

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWD=qwerty
SSLCOMMERZ_IS_SANDBOX=true
SITE_URL=http://localhost:3000
PORT=3000
WHATSAPP_NUMBER=8801516567622
```

Never commit a real `.env` file or live merchant credentials. The project `.gitignore` already excludes `.env`.

## Deployment

The included `render.yaml` deploys the project as a Render Node.js web service.

1. Connect this repository to Render.
2. Select **Deploy Blueprint**.
3. Wait until the deployment status is **Live**.
4. Open the generated HTTPS address.

Render supplies the public hostname and port automatically. The server uses that hostname for payment callback URLs.

## Payment notice

The public demo currently uses **SSLCommerz sandbox mode**. It does not process real money.

Before accepting real payments:

- Obtain live SSLCommerz merchant credentials.
- Set `SSLCOMMERZ_IS_SANDBOX=false`.
- Store credentials securely in the hosting provider's environment settings.
- Use a public HTTPS domain.
- Add persistent database storage for production order and payment records.

## Health check

The deployed server exposes:

```text
GET /api/health
```

It reports whether the application is running and whether payments are using sandbox or live mode.
