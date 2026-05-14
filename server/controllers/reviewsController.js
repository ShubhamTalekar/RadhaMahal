import { reviewsStore, persistStore } from '../utils/store.js';
import { esc } from '../utils/escape.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    res.json(reviewsStore[productId] || []);
});

export const addReview = asyncHandler(async (req, res) => {
    const { productId }       = req.params;
    const { author, rating, comment } = req.body;

    if (!author || !comment || !rating)                         return res.status(400).json({ success: false, message: 'Missing review fields' });
    if (typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    if (comment.length > 1000)                                  return res.status(400).json({ success: false, message: 'Comment too long' });

    const safeReview = {
        author:  esc(String(author).slice(0, 100)),
        rating:  Math.round(rating),
        comment: esc(String(comment).slice(0, 1000)),
        date:    new Date().toISOString(),
    };

    if (!reviewsStore[productId]) reviewsStore[productId] = [];
    reviewsStore[productId].unshift(safeReview);
    persistStore();
    res.status(201).json({ success: true, review: safeReview });
});
