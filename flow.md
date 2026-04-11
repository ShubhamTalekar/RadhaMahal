# Radha Mahal: Application Flow & Architecture

This document provides a comprehensive mapping of every feature within the digital atelier, detailing the user journey flow and the specific files responsible for executing those features in the codebase.

## 1. Application Shell & Routing
The core wrapper dictating navigation, global state, and persistent data synchronization.
*   **`src/main.jsx`**: Bootstraps React, wraps the app in `<GoogleOAuthProvider>`.
*   **`src/App.jsx`**: Handles `BrowserRouter` configuration. Defines standard `localStorage` session state variables (`user`, `bag`, `wishlist`) and binds them globally through outlet contexts. Protects routes by rendering `<Layout />`.
*   **`src/Layout.jsx`**: The persistent UI wrapper. Contains the `Navbar` (with hover-menus identifying categories) and the `Footer`.

## 2. Discovery & Homepage (The Entry Point)
Where patrons begin their journey, browsing curated sections.
*   **`src/Home.jsx`**: The aggregator. Orchestrates multiple sub-components. Fetches high-level Shopify data (carousel highlights vs total inventory).
*   **`src/components/figma/HeroSection.jsx`**: Renders dynamic slides for products specifically tagged `carousel`.
*   **`src/components/figma/FeaturedCategories.jsx`**: Dynamically maps distinct product groups based on Shopify tag distributions.
*   **`src/components/figma/NewArrivals.jsx`**: Sorts inventory by ID metadata chronologically to establish what's trending.
*   **`src/components/figma/Testimonials.jsx`**: Pulls from a combination of hardcoded praise and dynamic 4-to-5 star `product_reviews` captured across the platform.
*   **`src/components/figma/InstagramFeed.jsx`** & **`src/components/figma/OurStory.jsx`**: Brand-building visual layouts.

## 3. The Digital Catalog (Shopping Experience)
Flow from browsing collections to examining a specific garment.
*   **`src/ProductCatalog.jsx`**: 
    *   *Features*: Retrieves full Shopify catalog via Storefront API. Applies stateful filtering algorithms (by Category, Price, Name, Relevance). Renders grid. 
*   **`src/ProductDetail.jsx`**: 
    *   *Features*: Queries a specific product via deep-linked GIDs. Handles active image gallery swapping, dynamic size/variant availability toggles, pushing items to `ShoppingBag` or `Wishlist`. Contains the "Add to Cart" guard.
*   **`src/components/ProductReviews.jsx`**: 
    *   *Features*: Mounted at the bottom of the details page. Validates if the active `user` has a verified purchase history of the specific garment before permitting review generation.

## 4. Purchasing & Cart Control
The conversion pipeline.
*   **`src/ShoppingBag.jsx`**: Renders temporary session selections. Adjusts quantities and recalculates grand totals.
*   **`src/Wishlist.jsx`**: Long-term save list matching standard grid aesthetics.
*   **`src/Checkout.jsx`**: 
    *   *Features*: Instead of simulating an order, this maps local Cart states through `shopifyClient.js` to execute `createShopifyCart()`. Harvests the resulting `checkoutUrl` and actively redirects the patron’s browser to Shopify’s encrypted payment gateway.

## 5. Security & Authentication (Identity)
Mechanisms controlling access and account generation.
*   **`src/Login.jsx`**: 
    *   *Features*: Facilitates Email/Password routing directly to `customerAccessTokenCreate` on Storefront API. Or, leverages `<GoogleLogin>` configured with `{ action: 'login' }` enforcing strict 401 bounces on unknown identities.
*   **`src/Register.jsx`**: 
    *   *Features*: Opposite of login; focuses strictly on provisioning new identities in the Shopify admin via standard forms or Google OAuth bridges.
*   **`server/index.js` (`/api/gauth/sync`)**: The Node/Express bridge. Listens for Google JWT payloads and manipulates the Shopify Admin Database conditionally based on intent.

## 6. The User Profile (Account Management)
Post-conversion tracking and personalization.
*   **`src/Profile.jsx`**:
    *   *Session Guard*: Hard redirects any non-authenticated session traffic back to `/login`.
    *   *Avatar Generator*: Custom hidden DOM interacting with HTML5 `FileReader` converting imagery to Base64 locally.
    *   *Address Book*: Dynamically mapped state of purely user-input local addresses.
    *   *Bespoke Tracker*: Merges standard localStorage cache with the `GET /api/user/orders/` bridge to reveal live fulfillment stages from Shopify tracking origins.

## 7. Concierge & Static Support
The brand backbone.
*   **`src/Contact.jsx`**: 
    *   *Features*: Form capturing `Name, Email, Phone, Message`. Dispatches to Node server `POST /api/contact` which leverages Shopify Admin credentials to inject inquiries as Customer profiles and internal Notes.
*   **`src/OurStory.jsx`** / **`src/FAQ.jsx`** / **`src/SizeGuide.jsx`** / **`src/Privacy.jsx`** / **`src/Terms.jsx`**: Pure static, aesthetically cohesive marketing documents matching global typography parameters.

## 8. Data Hydration & External Bridges
The unified data channels.
*   **`src/shopifyClient.js`**: 
    *   *Features*: The sole gateway to `radha-mahal-2.myshopify.com/api/2024-01/graphql.json`. Handles fetching globally typed queries (Products, Cart Creation, Token Creation).
*   **`server/index.js`**: 
    *   *Features*: The centralized backend gateway to Shopify Admin REST APIs (`/admin/api/2024-01/`). Handles sensitive mutations (creating profiles, fetching deep tracking logs, bypassing storefront limitations) requiring secret application keys.
