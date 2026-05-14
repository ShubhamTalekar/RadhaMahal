import express from 'express';
import { requestRestockNotification } from '../controllers/notificationsController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();
router.post('/restock-notification', contactLimiter, requestRestockNotification);
export default router;
