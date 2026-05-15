import { z } from 'zod';

// ─── Reusable field schemas ──────────────────────────────────────────────────
const email = z.string().email('Invalid email address').max(254);
const name  = z.string().min(1, 'Name is required').max(200);
const phone = z.string().min(5, 'Phone number too short').max(20).optional();

// ─── Per-endpoint schemas ────────────────────────────────────────────────────

/** POST /api/contact */
export const contactSchema = z.object({
    name,
    email,
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string().min(1, 'Message is required').max(5000),
});

/** POST /api/consultation */
export const consultationSchema = z.object({
    name,
    email,
    phone: z.string().min(5, 'Phone number too short').max(20),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    time: z.string().min(1, 'Time is required').max(20),
});

/** POST /api/gauth/sync */
export const gauthSyncSchema = z.object({
    email,
    name: z.string().optional(),
    action: z.enum(['login', 'register']).optional(),
});

/** POST /api/wishlist/sync and POST /api/bag/sync */
export const syncItemsSchema = z.object({
    email,
    items: z.array(z.object({
        id: z.union([z.string(), z.number()]).transform(String),
        title: z.string().optional(),
    })).default([]),
});

/** POST /api/restock-notification */
export const restockSchema = z.object({
    email,
    productId:   z.string().min(1, 'Product ID is required'),
    variantId:   z.string().optional(),
    productName: z.string().min(1, 'Product name is required').max(500),
});

/** POST /api/reviews/:productId */
export const reviewSchema = z.object({
    author:  z.string().min(1).max(100),
    rating:  z.number().int().min(1).max(5),
    comment: z.string().min(1).max(1000),
});

/** POST /api/admin/login */
export const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
