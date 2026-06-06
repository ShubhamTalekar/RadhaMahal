import express from 'express';
import {
    getBannerConfig,
    updateBannerConfig,
    getDashboardData,
    deleteUserSimulated,
    adminLogin,
    adminLogout,
    getAdminReviews,
    createAdminReview,
    updateAdminReview,
    deleteAdminReview,
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { adminLimiter, loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.post('/admin/login', loginLimiter, adminLogin);
router.post('/admin/logout', adminLogout);
router.get('/public/banner', getBannerConfig);
router.post('/admin/banner', verifyAdmin, adminLimiter, upload.single('image'), updateBannerConfig);
router.get('/admin/dashboard', verifyAdmin, adminLimiter, getDashboardData);
router.delete('/admin/users/delete', verifyAdmin, adminLimiter, deleteUserSimulated);

// Admin Reviews CRUD routes
router.get('/admin/reviews', verifyAdmin, adminLimiter, getAdminReviews);
router.post('/admin/reviews/:productId', verifyAdmin, adminLimiter, createAdminReview);
router.put('/admin/reviews/:productId/:reviewId', verifyAdmin, adminLimiter, updateAdminReview);
router.delete('/admin/reviews/:productId/:reviewId', verifyAdmin, adminLimiter, deleteAdminReview);

export default router;
