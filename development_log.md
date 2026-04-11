# Radha Mahal: Daily Development Log
**Project Window:** March 18, 2026 – March 29, 2026

## March 18, 2026
**Initialization & Core Architecture**
- Initialized the React + Vite repository.
- Configured Tailwind CSS with custom theme variables for the "Digital Atelier" aesthetic (deep purples, golds, off-whites).
- Set up React Router for SPA navigation (`App.jsx`).
- Scaffolded core directories (`src/components`, `src/assets`, `server/`).
- Designed the global `Layout.jsx` covering the persistent Navigation Bar and Footer.

## March 19, 2026
**Homepage & Landing Experience**
- Built out `Home.jsx` incorporating various UI components.
- Engineered diving deep into the `HeroSection.jsx` to implement the carousel.
- **Fix:** Adjusted carousel styling to ensure background images were full-width and not cutting off foreground text content.
- Drafted the `FeaturedCategories.jsx` and static placeholders for New Arrivals.

## March 20, 2026
**Shopify Storefront API Integration**
- Transitioned away from hardcoded mock data.
- Built `shopifyClient.js` integrating the Shopify Storefront GraphQL API.
- Implemented `getProducts` and `getCarouselProducts` queries.
- Mapped product variants, pricing, and dynamic collections to accurately reflect real-time live inventory.

## March 21, 2026
**Catalog & Product Detail Architecture**
- Developed `ProductCatalog.jsx` with active filtering based on dynamically fetched tags and categories.
- Engineered `ProductDetail.jsx` utilizing the GID (Global ID) `defaultVariantId` parsing mechanism.
- Handled size selection, variants inventory checks, and image gallery logic.

## March 22, 2026
**Global State: Shopping Bag & Wishlist**
- Hooked up persistent `localStorage` states in `App.jsx` for shopping carts and wishlists.
- Built `ShoppingBag.jsx` with subtotal calculations and quantity management.
- Implemented `Wishlist.jsx` to retain patron-saved heirloom selections.

## March 23, 2026
**Secure Checkout Flow**
- Replaced the local mock checkout with `createShopifyCart` in `shopifyClient.js`.
- Wired `Checkout.jsx` to dynamically inject the cart payload and execute a redirect to the official, secure `radha-mahal.myshopify.com` checkout portal.
- Implemented null-checks and guards for invalid `merchandiseId` errors on single-variant garments.

## March 24, 2026
**Modernizing Information Subpages**
- Redesigned and applied the premium aesthetic to `OurStory.jsx`, `Contact.jsx`, and `Profile.jsx`.
- Modified product display logic in `ProductCatalog.jsx` to dynamically render the "New Arrivals" section utilizing reverse sorting of Shopify IDs.
- Ensured cohesive typography (Playfair Display & Cormorant Garamond) across all text-heavy routes.

## March 25, 2026
**Backend Node.js Integration (Admin API)**
- Bootstrapped Express server (`server/index.js`) to support privileged operations.
- Built `POST /api/contact` route communicating directly with the Shopify Admin API via `SHOPIFY_ADMIN_ACCESS_TOKEN`.
- Wired the frontend `Contact.jsx` form to generate Shopify Customer Profiles tagged with `Contact-Inquiry` and attach their messages as Customer Notes.

## March 26, 2026
**Authentication & Account Registrations**
- Drafted the foundation for `Register.jsx` and `Login.jsx`.
- Wired standard email/password registration to create customers in the Shopify directory natively.
- Developed the `GET /api/user/orders/:email` bridge on the backend to pull fulfillment data and tracking links securely via the Admin API.
- Re-architected `Profile.jsx` to consume live tracking constraints.

## March 27, 2026
**OAuth Integration & Google Sign-In**
- Installed `@react-oauth/google` and `jwt-decode`.
- Wrapped the layout in the `GoogleOAuthProvider`.
- Inserted standard "Sign in with Google" buttons on both Login and Register forms.
- Configured the required Google Cloud Console client parameters.

## March 28, 2026
**Enforced Shopify Authentication**
- Mapped standard email/password logins to the Storefront API `customerAccessTokenCreate` mutation to enforce database verification.
- Built `POST /api/gauth/sync` on the Node server.
- Intercepted Google Login attempts to verify intent (`action: login` vs `register`), throwing a 401 Unauthorized if untracked guests attempt to bypass registration.

## March 29, 2026
**Profile Refinements & User Feedback Loops**
- Added strict Route Protection (Session Redirects) preventing unauthenticated access to `Profile.jsx`.
- Developed a custom Base64 `FileReader` for profile photo avatars inside `Profile.jsx`.
- Stripped away hardcoded mock destinations from the Address components.
- Harvested local caching mechanisms to funnel verified 4-star and 5-star product reviews directly into the `Testimonials.jsx` homepage carousel dynamically.
