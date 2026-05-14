import { findCustomerByEmail, createCustomer } from '../services/shopify.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const syncGoogleAuth = asyncHandler(async (req, res) => {
    const { email, name } = req.body;
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });

    const existing = await findCustomerByEmail(email);
    if (existing) {
        console.log(`[Google Auth] Customer exists: ${email}`);
        return res.status(200).json({ success: true, message: 'Existing customer synced', shopifyId: existing.id });
    }

    if (req.body.action === 'login') {
        console.log(`[Google Auth] Rejected unknown login: ${email}`);
        return res.status(401).json({ success: false, message: 'Customer not found. Please Request an Invitation to create your profile.' });
    }

    const parts    = name ? name.split(' ') : ['Google', 'Patron'];
    const customer = await createCustomer({ first_name: parts[0], last_name: parts.slice(1).join(' ') || 'Patron', email, tags: 'Google-Auth', verified_email: true, send_email_welcome: false });
    console.log(`[Google Auth] Created customer: ${email}`);
    res.status(200).json({ success: true, message: 'Shopify customer created', shopifyId: customer.id });
});
