import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { JWT_SECRET } from '../config/env.js';
import { SHOPIFY_DOMAIN, SHOPIFY_API_VERSION } from '../config/env.js';

// ── Cookie helpers ────────────────────────────────────────────────────────────
function setCustCookie(req, res, token) {
    const isRemote = req.hostname !== 'localhost' && req.hostname !== '127.0.0.1';
    res.cookie('customer_token', token, {
        httpOnly: true,
        secure:   isRemote,
        sameSite: isRemote ? 'none' : 'lax',
        maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
        path:     '/',
    });
}

function clearCustCookie(req, res) {
    const isRemote = req.hostname !== 'localhost' && req.hostname !== '127.0.0.1';
    res.clearCookie('customer_token', {
        httpOnly: true,
        secure:   isRemote,
        sameSite: isRemote ? 'none' : 'lax',
        path:     '/',
    });
}

// ── Verify a Shopify Storefront customer access token ────────────────────────
async function verifyShopifyToken(customerAccessToken) {
    const domain = SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
    const version = SHOPIFY_API_VERSION || '2025-01';
    const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

    const query = `
        query getCustomer($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) {
                id
                email
                firstName
                lastName
                phone
            }
        }
    `;

    const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontToken || '',
        },
        body: JSON.stringify({ query, variables: { customerAccessToken } }),
    });

    const data = await res.json();
    return data?.data?.customer || null;
}

// ── POST /api/v1/customer/login ───────────────────────────────────────────────
// Called by the frontend after Shopify login. Receives the customerAccessToken,
// verifies it, upserts the customer in Supabase, and issues a session cookie.
export const customerLogin = asyncHandler(async (req, res) => {
    const { customerAccessToken, email } = req.body;

    if (!customerAccessToken || !email) {
        return res.status(400).json({ success: false, message: 'Missing customerAccessToken or email.' });
    }

    // Verify token with Shopify
    const shopifyCustomer = await verifyShopifyToken(customerAccessToken);
    if (!shopifyCustomer || shopifyCustomer.email !== email) {
        return res.status(401).json({ success: false, message: 'Invalid Shopify token.' });
    }

    // Upsert customer in Supabase — create record if first time logging in
    let dbUser = null;
    if (supabase) {
        const { data, error } = await supabase
            .from('users')
            .upsert({
                email: email,
                first_name: shopifyCustomer.firstName,
                last_name:  shopifyCustomer.lastName,
                role: 'customer',
            }, { onConflict: 'email', ignoreDuplicates: false })
            .select()
            .single();

        if (!error) dbUser = data;
    }

    // Issue JWT customer session cookie
    const token = jwt.sign({ email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    setCustCookie(req, res, token);

    // Return profile data from DB (includes any previously saved name/phone/addresses)
    const profile = dbUser ? {
        name: `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim(),
        phone: dbUser.phone || '',
        addresses: dbUser.addresses || [],
        photoUrl: dbUser.photo_url || null,
    } : {};

    res.json({ success: true, profile });
});

// ── GET /api/v1/customer/profile ─────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
    const email = req.customer.email; // set by verifyCustomer middleware

    if (!supabase) {
        return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, phone, addresses, photo_url')
        .eq('email', email)
        .single();

    if (error || !data) {
        return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.json({
        success: true,
        profile: {
            name:      `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            phone:     data.phone || '',
            addresses: data.addresses || [],
            photoUrl:  data.photo_url || null,
        },
    });
});

// ── PUT /api/v1/customer/profile ─────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
    const email = req.customer.email;
    const { name, phone, addresses, photoUrl } = req.body;

    if (!supabase) {
        return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    // Split name into first/last
    const nameParts  = (name || '').trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name  = nameParts.slice(1).join(' ') || '';

    const updatePayload = {};
    if (name      !== undefined) { updatePayload.first_name = first_name; updatePayload.last_name = last_name; }
    if (phone     !== undefined) updatePayload.phone      = phone;
    if (addresses !== undefined) updatePayload.addresses  = addresses;
    if (photoUrl  !== undefined) updatePayload.photo_url  = photoUrl;

    const { data, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('email', email)
        .select('first_name, last_name, phone, addresses, photo_url')
        .single();

    if (error) {
        console.error('[updateProfile] Supabase error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }

    res.json({
        success: true,
        profile: {
            name:      `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            phone:     data.phone || '',
            addresses: data.addresses || [],
            photoUrl:  data.photo_url || null,
        },
    });
});

// ── POST /api/v1/customer/logout ─────────────────────────────────────────────
export const customerLogout = asyncHandler(async (req, res) => {
    clearCustCookie(req, res);
    res.json({ success: true });
});
