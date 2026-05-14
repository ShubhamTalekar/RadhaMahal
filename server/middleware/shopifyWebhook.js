import crypto from 'crypto';
import { SHOPIFY_WEBHOOK_SECRET } from '../config/env.js';

/** Verifies the X-Shopify-HMAC-SHA256 header on incoming webhook requests */
export function verifyShopifyWebhook(req, res, next) {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    if (!SHOPIFY_WEBHOOK_SECRET || !hmac) return res.status(401).json({ error: 'Unauthorized' });

    const digest = crypto
        .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('base64');

    if (digest !== hmac) return res.status(401).json({ error: 'Invalid signature' });
    next();
}
