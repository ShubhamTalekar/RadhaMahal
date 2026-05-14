import { findCustomerByEmail, createCustomer, updateCustomer, upsertMetafield } from '../services/shopify.js';
import { validateFields } from '../utils/validation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const syncWishlist = asyncHandler(async (req, res) => {
    const { email, wishlist } = req.body;
    if (!validateFields({ email }, res)) return;
    if (!Array.isArray(wishlist)) return res.status(400).json({ success: false, message: 'Invalid wishlist data' });
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });

    const customer = await findCustomerByEmail(email) || await createCustomer({
        first_name: (email.split('@')[0] || 'Patron').split(/[._]/)[0] || 'Radha',
        last_name: 'Mahal Patron', email, verified_email: true, send_email_welcome: false,
    });

    const payload = wishlist.map(i => ({ id: String(i.id), title: i.title, price: i.final_price || i.price, image: i.image || '', category: i.category || '' }));
    await upsertMetafield(customer.id, 'radha_mahal', 'wishlist', payload);

    // Also write human-readable summary to customer Note
    const existingNote       = customer.note || '';
    const noteWithoutWishlist = existingNote.replace(/\n\n=== WISHLIST ===[^\0]*$/, '').trimEnd();
    const wishlistNote       = payload.length > 0 ? `\n\n=== WISHLIST ===\n${payload.map(i => `- ${i.title} (₹${Number(i.price).toLocaleString('en-IN')})`).join('\n')}` : '';
    await updateCustomer(customer.id, { note: (noteWithoutWishlist + wishlistNote).trim() });

    console.log(`[Wishlist] Synced ${payload.length} items for ${email}`);
    res.status(200).json({ success: true, message: 'Wishlist synced to Shopify metafield & note' });
});
