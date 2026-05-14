import express from 'express';
import { syncWishlist } from '../controllers/wishlistController.js';
const router = express.Router();
router.post('/wishlist/sync', syncWishlist);
export default router;
