import { fetchVariantByInventoryItem, fetchProductTitle, paginateCustomers, fetchCustomerMetafields } from '../services/shopify.js';
import { createGmailTransporter, sendOOSEmails } from '../services/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const handleInventoryUpdate = asyncHandler(async (req, res) => {
    const { available, inventory_item_id, product_title } = req.body;
    if (available > 0) return res.status(200).json({ skipped: true });

    console.log(`[OOS] Stock hit 0 — inventory_item_id: ${inventory_item_id}`);

    let productTitle = product_title || '';
    let productId    = '';

    if (inventory_item_id && SHOPIFY_ADMIN_TOKEN) {
        const variantData = await fetchVariantByInventoryItem(inventory_item_id);
        const variant     = variantData.variants?.[0];
        if (variant) {
            productId    = String(variant.product_id);
            productTitle = await fetchProductTitle(variant.product_id) || productTitle;
        }
    }

    if (!productTitle && !productId) {
        console.warn('[OOS] Could not resolve product — skipping.');
        return res.status(200).json({ skipped: true });
    }

    console.log(`[OOS] "${productTitle}" (id: ${productId}) is now out of stock.`);

    const emailsToNotify = new Set();
    for await (const customers of paginateCustomers('id,email')) {
        await Promise.all(customers.map(async c => {
            if (!c.email) return;
            const metafields = await fetchCustomerMetafields(c.id);
            for (const mf of metafields) {
                if (mf.key === 'wishlist' || mf.key === 'bag') {
                    try {
                        const items = JSON.parse(mf.value);
                        if (Array.isArray(items) && items.some(i => String(i.id) === productId)) {
                            emailsToNotify.add(c.email);
                            console.log(`[OOS] Match: ${c.email}`);
                        }
                    } catch { /* ignore parse errors */ }
                }
            }
        }));
    }

    if (emailsToNotify.size === 0) { console.log('[OOS] No users to notify.'); return res.status(200).json({ notified: 0 }); }

    const transporter = createGmailTransporter();
    if (!transporter) { console.warn('[OOS] Gmail not configured.'); return res.status(200).json({ notified: 0, error: 'email not configured' }); }

    await sendOOSEmails(transporter, emailsToNotify, productTitle);
    res.status(200).json({ success: true, notified: emailsToNotify.size });
});
