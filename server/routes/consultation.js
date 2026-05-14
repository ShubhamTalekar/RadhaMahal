import express from 'express';
import { submitConsultation } from '../controllers/consultationController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();
router.post('/consultation', contactLimiter, submitConsultation);
export default router;
