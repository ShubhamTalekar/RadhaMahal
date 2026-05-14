import express from 'express';
import { getBannerConfig, updateBannerConfig, getDashboardData, deleteUserSimulated, adminLogin } from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { adminLimiter, loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.post('/admin/login', loginLimiter, adminLogin);
router.get('/public/banner', getBannerConfig);
router.post('/admin/banner', verifyAdmin, adminLimiter, upload.single('image'), updateBannerConfig);
router.get('/admin/dashboard', verifyAdmin, adminLimiter, getDashboardData);
router.delete('/admin/users/delete', verifyAdmin, adminLimiter, deleteUserSimulated);
export default router;
