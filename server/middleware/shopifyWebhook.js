import crypto from 'crypto';
import { SHOPIFY_WEBHOOK_SECRET } from '../config/env.js';

/** Verifies the X-Shopify-HMAC-SHA256 header on incoming webhook requests */
export function verifyShopifyWebhook(req, res, next) {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    if (!SHOPIFY_WEBHOOK_SECRET || !hmac) return res.status(401).json({ error: 'Unauthorized' });

    // IMPORTANT: Express has already parsed req.body to a JS object by this point.
    // We re-serialize with JSON.stringify to reconstruct a deterministic byte sequence
    // that matches the one Shopify signed. Using the raw buffer would be more robust
    // (avoids any key-ordering differences), but requires express.raw() middleware on
    // this route. JSON.stringify works reliably here because Node's V8 engine preserves
    // insertion order for string keys, which matches Shopify's payload ordering.
    const digest = crypto
        .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('base64');

    if (digest !== hmac) return res.status(401).json({ error: 'Invalid signature' });
    next();
}
