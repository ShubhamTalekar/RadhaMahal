import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import {
    getBannerConfig as fetchBannerConfig,
    setBannerConfig as saveBannerConfig,
    getReviewsStore,
    setReviewsStore,
} from '../utils/store.js';
import { esc } from '../utils/escape.js';
import { paginateCustomers } from '../services/shopify.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';
import { supabase } from '../services/supabase.js';
import { SHOPIFY_ADMIN_TOKEN, ADMIN_PASSWORD, JWT_SECRET, EMADMIN_EMAIL } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log('--- ADMIN LOGIN ATTEMPT ---');
    console.log('Received email:', email);
    console.log('---------------------------');

    let isAuthenticated = false;
    let authSource = 'none';

    // 1. Try DB Auth via Supabase
    if (supabase) {
        try {
            const { data: dbUser, error } = await supabase.from('users').select('*').eq('email', email).single();

            if (error) {
                console.warn('[Admin Login] DB query warning:', error.message);
            } else if (dbUser && dbUser.password_hash) {
                const isMatch = await bcrypt.compare(password, dbUser.password_hash);
                if (isMatch && dbUser.role === 'admin') {
                    isAuthenticated = true;
                    authSource = 'database';
                    console.log('[Admin Login] Successfully authenticated via Database!');
                } else if (!isMatch) {
                    console.warn('[Admin Login] Password mismatch in database.');
                } else if (dbUser.role !== 'admin') {
                    console.warn('[Admin Login] User is not an admin in database.');
                }
            } else {
                console.warn('[Admin Login] User not found in database or has no password hash.');
            }
        } catch (err) {
            console.error('[Admin Login] Database auth unexpected error:', err);
        }
    }

    // 2. Fallback to Env-based Auth (useful for local fallback or when DB is not configured)
    if (!isAuthenticated) {
        const allowedEmails = ['admin@radhamahal.com'];
        if (EMADMIN_EMAIL) allowedEmails.push(EMADMIN_EMAIL);

        if (allowedEmails.includes(email) && password === ADMIN_PASSWORD) {
            isAuthenticated = true;
            authSource = 'environment';
            console.log('[Admin Login] Successfully authenticated via Environment variables fallback!');
        }
    }

    if (!isAuthenticated) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ email, role: 'admin', source: authSource }, JWT_SECRET, { expiresIn: '12h' });

    // Set HttpOnly cookie — not accessible to JavaScript, preventing XSS token theft.
    // We use SameSite=None and Secure=true for remote cross-domain environments.
    const isRemote = req.hostname !== 'localhost' && req.hostname !== '127.0.0.1';
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: isRemote,
        sameSite: isRemote ? 'none' : 'lax',
        maxAge: 12 * 60 * 60 * 1000, // 12 hours, matches JWT expiry
        path: '/',
    });

    res.json({ success: true });
});

/** Clear the admin cookie (logout) */
export const adminLogout = asyncHandler(async (req, res) => {
    const isRemote = req.hostname !== 'localhost' && req.hostname !== '127.0.0.1';
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: isRemote,
        sameSite: isRemote ? 'none' : 'lax',
        path: '/',
    });
    res.json({ success: true });
});

export const getBannerConfig = asyncHandler(async (req, res) => {
    const config = await fetchBannerConfig();
    res.json({ success: true, data: config });
});

export const updateBannerConfig = asyncHandler(async (req, res) => {
    const {
        titlePrefix,
        titleHighlight,
        description,
        buttonText,
        discountNum,
        discountLabel,
        designsNum,
        designsLabel,
        badgeTitle,
        badgeLabel,
        _imageBase64,
        marqueeText,
    } = req.body;

    const currentConfig = await fetchBannerConfig();
    let parsedImageUrl = currentConfig.imageUrl;

    if (req.file) {
        try {
            const fileName = `banner-${crypto.randomUUID()}.webp`;

            // Process the image buffer using sharp
            const webpBuffer = await sharp(req.file.buffer)
                .resize(1920, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            if (supabase) {
                // Upload to Supabase Storage bucket 'avatars'
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(`banner/${fileName}`, webpBuffer, {
                        contentType: 'image/webp',
                        upsert: true,
                    });

                if (uploadError) {
                    console.error('Supabase storage upload error:', uploadError);
                    throw uploadError;
                }

                const { data } = supabase.storage.from('avatars').getPublicUrl(`banner/${fileName}`);
                parsedImageUrl = data.publicUrl;
            } else {
                // Fallback to local file system if Supabase is not configured
                const uploadDir = path.resolve(__dirname, '../uploads');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
                const filePath = path.resolve(uploadDir, fileName);
                await fs.promises.writeFile(filePath, webpBuffer);
                parsedImageUrl = `/uploads/${fileName}`;
            }
        } catch (err) {
            console.error('Image processing/upload error:', err);
            return res.status(500).json({ success: false, message: 'Failed to process/upload image: ' + err.message });
        }
    }

    const newConfig = {
        ...currentConfig,
        titlePrefix: titlePrefix !== undefined ? titlePrefix : currentConfig.titlePrefix,
        titleHighlight: titleHighlight !== undefined ? titleHighlight : currentConfig.titleHighlight,
        description: description !== undefined ? description : currentConfig.description,
        buttonText: buttonText !== undefined ? buttonText : currentConfig.buttonText,
        discountNum: discountNum !== undefined ? discountNum : currentConfig.discountNum,
        discountLabel: discountLabel !== undefined ? discountLabel : currentConfig.discountLabel,
        designsNum: designsNum !== undefined ? designsNum : currentConfig.designsNum,
        designsLabel: designsLabel !== undefined ? designsLabel : currentConfig.designsLabel,
        badgeTitle: badgeTitle !== undefined ? badgeTitle : currentConfig.badgeTitle,
        badgeLabel: badgeLabel !== undefined ? badgeLabel : currentConfig.badgeLabel,
        imageUrl: parsedImageUrl,
        marqueeText:
            marqueeText !== undefined ? marqueeText : currentConfig.marqueeText || 'Free shipping all over Maharashtra',
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
        users.push(
            ...customersPage.map(c => {
                let wishlistText = [];
                if (c.note && c.note.includes('=== WISHLIST ===')) {
                    const parts = c.note.split('=== WISHLIST ===');
                    if (parts[1])
                        wishlistText = parts[1]
                            .trim()
                            .split('\n')
                            .map(l => l.replace(/^- /, ''));
                }
                return {
                    id: c.id,
                    email: c.email,
                    firstName: c.first_name,
                    lastName: c.last_name,
                    ordersCount: c.orders_count || 0,
                    wishlist: wishlistText.map(t => ({ title: t })),
                };
            })
        );
    }

    // Shopify Admin API limits fetching all orders without pagination,
    // this mimics the original index.js logic which also didn't paginate orders.
    // In a real app, you would paginate or use GraphQL.
    const url = `https://${process.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com'}/admin/api/${process.env.VITE_SHOPIFY_API_VERSION || '2025-01'}/orders.json?status=any&limit=250`;
    const ordersRes = await fetch(url, {
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
    });

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
            id: o.order_number,
            customerEmail: o.contact_email || o.email,
            date: o.created_at,
            total: parseFloat(o.total_price),
            items: (o.line_items || []).map(li => ({ title: li.title, quantity: li.quantity })),
        };
    });

    const bestSellers = Object.entries(productsSold)
        .map(([title, sold]) => ({ title, sold }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
    const wishlistCounts = {};
    users.forEach(u =>
        u.wishlist.forEach(w => {
            let name = w.title.split(' (₹')[0];
            if (!wishlistCounts[name]) wishlistCounts[name] = 0;
            wishlistCounts[name]++;
        })
    );
    const topWishlisted = Object.entries(wishlistCounts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    res.json({
        success: true,
        data: { users, orders, analytics: { totalRevenue, totalOrders: orders.length, bestSellers, topWishlisted } },
    });
});

export const deleteUserSimulated = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'User deleted (simulated)' });
});

export const getAdminReviews = asyncHandler(async (req, res) => {
    const store = await getReviewsStore();
    const allReviews = [];
    Object.entries(store).forEach(([productId, productReviews]) => {
        if (Array.isArray(productReviews)) {
            productReviews.forEach(r => {
                allReviews.push({
                    id: r.id || `${productId}-${r.date || Math.random()}`,
                    author: r.author || r.userName || 'Guest User',
                    rating: r.rating,
                    comment: r.comment,
                    date: r.date,
                    isVerified: !!r.isVerified,
                    productId,
                });
            });
        }
    });
    // Sort reviews by date descending
    allReviews.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.json({ success: true, reviews: allReviews });
});

export const createAdminReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { author, rating, comment, isVerified } = req.body;

    if (!author || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const safeReview = {
        id: Date.now(),
        author: esc(String(author).slice(0, 100)),
        rating: Math.round(Number(rating)),
        comment: esc(String(comment).slice(0, 1000)),
        isVerified: !!isVerified,
        date: new Date().toISOString(),
    };

    const store = await getReviewsStore();
    if (!store[productId]) store[productId] = [];
    store[productId].unshift(safeReview);

    await setReviewsStore(store);
    res.status(201).json({ success: true, message: 'Review created successfully', review: safeReview });
});

export const updateAdminReview = asyncHandler(async (req, res) => {
    const { productId, reviewId } = req.params;
    const { author, rating, comment, isVerified } = req.body;

    const store = await getReviewsStore();
    if (!store[productId]) {
        return res.status(404).json({ success: false, message: 'Product reviews not found' });
    }

    const reviewsList = store[productId];
    const idx = reviewsList.findIndex(r => {
        const rId = r.id || `${productId}-${r.date || ''}`;
        return String(rId) === String(reviewId);
    });

    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = reviewsList[idx];
    if (author !== undefined) review.author = esc(String(author).slice(0, 100));
    if (rating !== undefined) review.rating = Math.round(Number(rating));
    if (comment !== undefined) review.comment = esc(String(comment).slice(0, 1000));
    if (isVerified !== undefined) review.isVerified = !!isVerified;

    store[productId] = reviewsList;
    await setReviewsStore(store);

    res.json({ success: true, message: 'Review updated successfully', review });
});

export const deleteAdminReview = asyncHandler(async (req, res) => {
    const { productId, reviewId } = req.params;

    const store = await getReviewsStore();
    if (!store[productId]) {
        return res.status(404).json({ success: false, message: 'Product reviews not found' });
    }

    const reviewsList = store[productId];
    const initialLength = reviewsList.length;
    const filteredList = reviewsList.filter(r => {
        const rId = r.id || `${productId}-${r.date || ''}`;
        return String(rId) !== String(reviewId);
    });

    if (filteredList.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (filteredList.length === 0) {
        delete store[productId];
    } else {
        store[productId] = filteredList;
    }

    await setReviewsStore(store);
    res.json({ success: true, message: 'Review deleted successfully' });
});
