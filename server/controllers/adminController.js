import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import { getBannerConfig as fetchBannerConfig, setBannerConfig as saveBannerConfig } from '../utils/store.js';
import { paginateCustomers, fetchOrdersByEmail } from '../services/shopify.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN, ADMIN_PASSWORD, JWT_SECRET, EMADMIN_EMAIL } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    console.log('--- ADMIN LOGIN ATTEMPT ---');
    console.log('Received email:', email);
    console.log('Received password:', password);
    console.log('Expected email:', 'admin@radhamahal.com');
    console.log('Expected password:', ADMIN_PASSWORD);
    console.log('---------------------------');

    const allowedEmails = ['admin@radhamahal.com'];
    if (EMADMIN_EMAIL) allowedEmails.push(EMADMIN_EMAIL);

    // Simplistic auth since there's only one admin user
    if (!allowedEmails.includes(email) || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });

    // Set HttpOnly cookie — not accessible to JavaScript, preventing XSS token theft.
    // SameSite=Lax allows the cookie to be sent on top-level navigations.
    // Secure=true ensures it's only sent over HTTPS (NODE_ENV=production).
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   12 * 60 * 60 * 1000, // 12 hours, matches JWT expiry
        path:     '/',
    });

    res.json({ success: true });
});

/** Clear the admin cookie (logout) */
export const adminLogout = asyncHandler(async (_req, res) => {
    res.clearCookie('admin_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    res.json({ success: true });
});

export const getBannerConfig = asyncHandler(async (req, res) => {
    const config = await fetchBannerConfig();
    res.json({ success: true, data: config });
});

export const updateBannerConfig = asyncHandler(async (req, res) => {
    const {
        titlePrefix, titleHighlight, description,
        buttonText, discountNum, discountLabel,
        designsNum, designsLabel, badgeTitle, badgeLabel,
        imageBase64, marqueeText
    } = req.body;

    const currentConfig = await fetchBannerConfig();
    let parsedImageUrl = currentConfig.imageUrl;

    if (req.file) {
        try {
            const uploadDir = path.resolve(__dirname, '../uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

            const fileName = `banner-${crypto.randomUUID()}.webp`;
            const filePath = path.resolve(uploadDir, fileName);

            await sharp(req.file.buffer)
                .resize(1920, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                // strip metadata implicitly by not calling withMetadata()
                .toFile(filePath);

            parsedImageUrl = `/uploads/${fileName}`;
        } catch (err) {
            console.error('Sharp processing error:', err);
            return res.status(500).json({ success: false, message: 'Failed to process image' });
        }
    }

    const newConfig = {
        ...currentConfig,
        titlePrefix:    titlePrefix !== undefined ? titlePrefix : currentConfig.titlePrefix,
        titleHighlight: titleHighlight !== undefined ? titleHighlight : currentConfig.titleHighlight,
        description:    description !== undefined ? description : currentConfig.description,
        buttonText:     buttonText !== undefined ? buttonText : currentConfig.buttonText,
        discountNum:    discountNum !== undefined ? discountNum : currentConfig.discountNum,
        discountLabel:  discountLabel !== undefined ? discountLabel : currentConfig.discountLabel,
        designsNum:     designsNum !== undefined ? designsNum : currentConfig.designsNum,
        designsLabel:   designsLabel !== undefined ? designsLabel : currentConfig.designsLabel,
        badgeTitle:     badgeTitle !== undefined ? badgeTitle : currentConfig.badgeTitle,
        badgeLabel:     badgeLabel !== undefined ? badgeLabel : currentConfig.badgeLabel,
        imageUrl:       parsedImageUrl,
        marqueeText:    marqueeText !== undefined ? marqueeText : (currentConfig.marqueeText || "Free shipping all over Maharashtra")
    };

    try {
        await saveBannerConfig(newConfig);
    } catch (err) {
        console.error('saveBannerConfig failed:', err);
        return res.status(500).json({ success: false, message: 'Failed to save banner config: ' + err.message });
    }
    res.json({ success: true, message: 'Banner updated successfully', data: newConfig });
});

export const getDashboardData = asyncHandler(async (req, res) => {
    if (!SHOPIFY_ADMIN_TOKEN || SHOPIFY_ADMIN_TOKEN === 'dummy_token') {
        return res.status(502).json({ success: false, error: 'Shopify Admin Token not configured in .env' });
    }

    const users = [];
    for await (const customersPage of paginateCustomers('id,email,first_name,last_name,orders_count,note')) {
        users.push(...customersPage.map(c => {
            let wishlistText = [];
            if (c.note && c.note.includes('=== WISHLIST ===')) {
                const parts = c.note.split('=== WISHLIST ===');
                if (parts[1]) wishlistText = parts[1].trim().split('\n').map(l => l.replace(/^- /, ''));
            }
            return {
                id: c.id, email: c.email, firstName: c.first_name, lastName: c.last_name,
                ordersCount: c.orders_count || 0, wishlist: wishlistText.map(t => ({ title: t }))
            };
        }));
    }

    // Shopify Admin API limits fetching all orders without pagination,
    // this mimics the original index.js logic which also didn't paginate orders.
    // In a real app, you would paginate or use GraphQL.
    const url = `https://${process.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com'}/admin/api/${process.env.VITE_SHOPIFY_API_VERSION || '2025-01'}/orders.json?status=any&limit=250`;
    const ordersRes = await fetch(url, { headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } });

    if (ordersRes.status === 401 || ordersRes.status === 403) {
        return res.status(502).json({ success: false, error: 'Invalid Shopify Admin Access Token' });
    }

    const ordersData = await ordersRes.json();
    let totalRevenue = 0;
    const productsSold = {};

    const orders = (ordersData.orders || []).map(o => {
        totalRevenue += parseFloat(o.total_price || 0);
        o.line_items.forEach(li => {
            if (!productsSold[li.title]) productsSold[li.title] = 0;
            productsSold[li.title] += li.quantity;
        });
        return {
            id: o.order_number, customerEmail: o.contact_email || o.email,
            date: o.created_at, total: parseFloat(o.total_price),
            items: (o.line_items || []).map(li => ({ title: li.title, quantity: li.quantity }))
        };
    });

    const bestSellers = Object.entries(productsSold).map(([title, sold]) => ({ title, sold })).sort((a, b) => b.sold - a.sold).slice(0, 5);
    const wishlistCounts = {};
    users.forEach(u => u.wishlist.forEach(w => {
        let name = w.title.split(' (₹')[0];
        if (!wishlistCounts[name]) wishlistCounts[name] = 0;
        wishlistCounts[name]++;
    }));
    const topWishlisted = Object.entries(wishlistCounts).map(([title, count]) => ({ title, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    res.json({ success: true, data: { users, orders, analytics: { totalRevenue, totalOrders: orders.length, bestSellers, topWishlisted } } });
});

export const deleteUserSimulated = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'User deleted (simulated)' });
});
