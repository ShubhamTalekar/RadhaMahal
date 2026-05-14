import express from 'express';
import { trackOrder } from '../controllers/ordersController.js';
const router = express.Router();
router.get('/track/:orderNumber', trackOrder);
export default router;
