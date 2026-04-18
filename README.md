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

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Email | Nodemailer (Gmail) |
| E-commerce | Shopify Storefront & Admin APIs |
| Routing | React Router DOM |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Shopify store with Storefront API access

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

Create a `.env` file in the root and in the `/server` directory:

**Root `.env`**
```env
VITE_SHOPIFY_STORE_URL=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_API_TOKEN=your_storefront_token
VITE_API_BASE_URL=http://localhost:3001
```

**Server `.env`**
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=your_admin_token
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_app_password
```

### Running Locally

```bash
# Start the backend server
cd server && node index.js

# In a new terminal, start the frontend
npm run dev
```

---

## 📁 Project Structure

```
RadhaMahal/
├── public/              # Static assets & images
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React context (Cart, Auth, etc.)
│   ├── App.jsx          # Root app with routing
│   ├── OurStory.jsx     # Our Story page
│   └── ...              # Other pages
├── server/
│   └── index.js         # Express backend (email, Shopify proxy)
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
