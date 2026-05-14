import { findCustomerByEmail, createCustomer, upsertMetafield } from '../services/shopify.js';
import { validateFields } from '../utils/validation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const syncBag = asyncHandler(async (req, res) => {
    const { email, bag } = req.body;
    if (!validateFields({ email }, res)) return;
    if (!Array.isArray(bag)) return res.status(400).json({ success: false, message: 'Invalid bag data' });
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });

    const parts    = (email.split('@')[0] || 'Patron').split(/[._]/);
    const customer = await findCustomerByEmail(email) || await createCustomer({
        first_name: parts[0] || 'Radha', last_name: parts.slice(1).join(' ') || 'Mahal Patron',
        email, verified_email: true, send_email_welcome: false,
    });

    const payload = bag.map(i => ({ id: String(i.id), title: i.title, price: i.final_price || i.price, image: i.image || '', category: i.category || '' }));
    await upsertMetafield(customer.id, 'radha_mahal', 'bag', payload);

    console.log(`[Bag] Synced ${payload.length} items for ${email}`);
    res.status(200).json({ success: true, message: 'Bag synced to Shopify metafield' });
});
