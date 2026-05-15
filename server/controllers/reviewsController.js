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

export const addReview = asyncHandler(async (req, res) => {
    const { productId }       = req.params;
    const parsed = validate(reviewSchema, req.body, res);
    if (!parsed) return;
    const { author, rating, comment } = parsed;

    const safeReview = {
        author:  esc(String(author).slice(0, 100)),
        rating:  Math.round(rating),
        comment: esc(String(comment).slice(0, 1000)),
        date:    new Date().toISOString(),
    };

    const store = await getReviewsStore();
    if (!store[productId]) store[productId] = [];
    store[productId].unshift(safeReview);
    
    await setReviewsStore(store);
    res.status(201).json({ success: true, review: safeReview });
});
