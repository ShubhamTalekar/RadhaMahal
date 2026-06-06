import { getReviewsStore, setReviewsStore } from '../utils/store.js';
import { esc } from '../utils/escape.js';
import { validate } from '../utils/validation.js';
import { reviewSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const store = await getReviewsStore();
    res.json(store[productId] || []);
});

export const getAllReviews = asyncHandler(async (req, res) => {
    const store = await getReviewsStore();
    const allReviews = [];
    Object.entries(store).forEach(([productId, productReviews]) => {
        if (Array.isArray(productReviews)) {
            productReviews.forEach(r => {
                allReviews.push({
                    id: r.id || `${productId}-${r.date || Math.random()}`,
                    userName: r.author || r.userName || 'Guest User',
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
    res.json(allReviews);
});

export const addReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const parsed = validate(reviewSchema, req.body, res);
    if (!parsed) return;
    const { author, rating, comment, isVerified } = parsed;

    const safeReview = {
        id: Date.now(),
        author: esc(String(author).slice(0, 100)),
        rating: Math.round(rating),
        comment: esc(String(comment).slice(0, 1000)),
        isVerified: !!isVerified,
        date: new Date().toISOString(),
    };

    const store = await getReviewsStore();
    if (!store[productId]) store[productId] = [];
    store[productId].unshift(safeReview);

    await setReviewsStore(store);
    res.status(201).json({ success: true, review: safeReview });
});
