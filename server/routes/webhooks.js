import express from 'express';
import { handleInventoryUpdate } from '../controllers/webhooksController.js';
import { verifyShopifyWebhook } from '../middleware/shopifyWebhook.js';
const router = express.Router();
router.post('/webhooks/inventory-update', verifyShopifyWebhook, handleInventoryUpdate);
export default router;
