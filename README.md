# Radha Mahal 🌸

> *Where every thread carries a story, and every story feels like home.*

Radha Mahal is a premium digital atelier for handcrafted Indian sarees and dresses — thoughtfully sourced directly from skilled artisan manufacturers. Built with a focus on authenticity, tradition, and a seamless luxury shopping experience.

---

## ✨ Features

- **Shopify-Backed Authentication** — Secure login, registration, and persistent session management via Shopify Storefront API
- **Dynamic Product Catalog** — Live product listing with collection filtering, search, and "New Arrivals" section powered by Shopify
- **Smart Cart & Wishlist** — Add to bag, wishlist, and seamless Shopify checkout redirect
- **Video Consultation Booking** — Request personalized styling sessions with automated email notifications
- **Restock Alerts** — Email notifications when wishlisted or bagged products return to stock
- **Global WhatsApp Widget** — Instant contact via WhatsApp
- **Dynamic Shipping Zones** — Regional shipping calculations for Maharashtra, Domestic, and Global deliveries
- **Custom Toast Notifications** — Framer Motion-powered toast system replacing native browser alerts
- **Animated UI** — Premium editorial-grade animations and micro-interactions throughout

---

## 🏗 Architecture

```
                      ┌─────────────────────────────────────────────┐
                      │          Browser / React SPA (Vite)         │
                      │  src/  ─ React Router ─ Tailwind CSS        │
                      │  Context: CartContext, AuthContext           │
                      └───────────────┬────────────────┬────────────┘
                                      │ Storefront API │ /api/v1/…
                       (GraphQL)      │                │ (REST/JSON)
                      ┌──────────────▼──┐   ┌──────────▼──────────────┐
                      │  Shopify CDN    │   │  Express Bridge Server  │
                      │  Storefront API │   │  server/  (Node.js)     │
                      │  (products,     │   │                         │
                      │   cart, auth)   │   │  ├ /api/contact         │
                      └─────────────────┘   │  ├ /api/consultation    │
                                            │  ├ /api/gauth/sync      │
                      ┌─────────────────┐   │  ├ /api/wishlist/sync   │
                      │  Shopify Admin  │◄──┤  ├ /api/bag/sync        │
                      │  REST API       │   │  ├ /api/track/:order    │
                      │  (customers,    │   │  ├ /api/reviews/:id     │
                      │   metafields,   │   │  ├ /api/admin/*         │
                      │   orders,       │   │  └ /api/webhooks/*      │
                      │   webhooks)     │   │                         │
                      └─────────────────┘   │  Services:             │
                                            │  ├ Nodemailer (Gmail)   │
                      ┌─────────────────┐   │  └ Supabase (store DB)  │
                      │  Supabase       │◄──┘                         │
                      │  (reviews,      │                             │
                      │   bannerConfig) │                             │
                      └─────────────────┘                             │
```

**API Docs:** When the server is running, visit [`http://localhost:5001/api-docs`](http://localhost:5001/api-docs) for the interactive Swagger UI.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Email | Nodemailer (Gmail) |
| E-commerce | Shopify Storefront & Admin APIs |
| Database | Supabase (reviews & banner config) |
| Process Manager | PM2 (cluster mode) |
| Error Tracking | Sentry |
| Routing | React Router DOM |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Shopify store with Storefront API access
- A Supabase project (for reviews & banner config persistence)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShubhamTalekar/RadhaMahal.git
cd RadhaMahal

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment Variables

Copy the examples and fill in your values:

```bash
cp .env.example .env.local
cp server/.env.example server/.env
```

**Root `.env.local`** (frontend + shared)
```env
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
VITE_API_BASE_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_WHATSAPP_NUMBER=919xxxxxxxxx
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_frontend_dsn   # optional
```

**Server `.env`** (backend only — never expose to browser)
```env
PORT=5001
NODE_ENV=development
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxx
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
EMADMIN_EMAIL=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SENTRY_DSN=your_sentry_backend_dsn         # optional
```

> **Supabase setup:** Run `server/supabase_schema.sql` in the Supabase SQL Editor once to create the required tables.

### Running Locally

```bash
# Start both frontend and backend together
npm run dev:all

# Or start them separately:
npm run dev          # Vite dev server  → http://localhost:5173
npm run server       # Express server   → http://localhost:5001
```

---

## 📁 Project Structure

```
RadhaMahal/
├── .github/workflows/    # CI/CD — lint, build, audit on every PR
├── public/               # Static assets & images
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React context (Cart, Auth, Wishlist, Bag)
│   ├── instrument.js     # Sentry frontend initialization (first import)
│   ├── App.jsx           # Root app with routing
│   └── ...               # Page components
├── server/
│   ├── config/           # env.js, shopify.js, swagger.js
│   ├── controllers/      # Route handler logic
│   ├── middleware/        # Auth, rate limiting, webhook HMAC
│   ├── routes/           # Express routers + openapi.js (JSDoc)
│   ├── services/         # Shopify API, email helpers
│   ├── utils/            # store.js (Supabase), asyncHandler, escape
│   ├── ecosystem.config.cjs  # PM2 cluster config
│   └── index.js          # Entry point (Sentry → app.listen)
├── render.yaml           # Render.com deployment blueprint
├── RUNBOOK.md            # Incident response & rollback guide
└── vite.config.js
```

---

## 🌸 About the Brand

Radha Mahal was born from a personal journey — from Neha, the name the world knows, to Radha, the identity rooted in home and heart. Every collection is handwoven, raw, and deeply rooted in authenticity — created with intention, love, and respect for tradition.

**Radha** — a soul, an identity.  
**Mahal** — not just walls, but emotions. A home where everyone is welcome.

---

## 📬 Contact

For business inquiries or styling consultations, visit the platform and book a **Video Consultation** or reach out via WhatsApp.

---

*© 2025 Radha Mahal. All rights reserved.*
