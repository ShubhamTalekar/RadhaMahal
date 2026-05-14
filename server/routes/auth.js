import express from 'express';
import { syncGoogleAuth } from '../controllers/authController.js';
const router = express.Router();
router.post('/gauth/sync', syncGoogleAuth);
export default router;
