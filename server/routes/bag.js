import express from 'express';
import { syncBag } from '../controllers/bagController.js';
const router = express.Router();
router.post('/bag/sync', syncBag);
export default router;
