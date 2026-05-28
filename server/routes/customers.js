import { Router } from 'express';
import { customerLogin, getProfile, updateProfile, customerLogout } from '../controllers/customerController.js';
import { verifyCustomer } from '../middleware/authMiddleware.js';

const router = Router();

// Public: authenticate with Shopify token and issue session cookie
router.post('/api/v1/customer/login', customerLogin);
router.post('/api/v1/customer/logout', customerLogout);

// Protected: require customer session cookie
router.get('/api/v1/customer/profile', verifyCustomer, getProfile);
router.put('/api/v1/customer/profile', verifyCustomer, updateProfile);

export default router;
