import { SHOPIFY_DOMAIN, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_TOKEN } from './env.js';

/** Base URL for all Shopify Admin REST API calls */
export const shopifyApiBase = () =>
    `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

/** Standard headers for Admin API requests */
export const shopifyHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
});

/** Read-only header (no Content-Type needed for GET) */
export const shopifyReadHeaders = () => ({
    'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
});
