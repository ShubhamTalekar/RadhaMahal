import express from 'express';
import { getReviews, addReview } from '../controllers/reviewsController.js';
import { reviewsLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();
router.get('/reviews/:productId', getReviews);
router.post('/reviews/:productId', reviewsLimiter, addReview);
export default router;
