import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first (Vite convention), then fall back to .env
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT                 = process.env.PORT || 5001;
export const NODE_ENV             = process.env.NODE_ENV || 'development';

export const CORS_ORIGINS         = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173')
                                      .split(',')
                                      .map(o => o.trim())
                                      .filter(Boolean);

export const SHOPIFY_DOMAIN       = process.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
export const SHOPIFY_ADMIN_TOKEN  = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
export const SHOPIFY_API_VERSION  = process.env.VITE_SHOPIFY_API_VERSION || '2025-01';
export const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
export const EMADMIN_EMAIL        = process.env.EMADMIN_EMAIL;
export const EMAIL_PASS           = process.env.EMAIL_PASS;

export const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD || 'admin';
export const JWT_SECRET           = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_me';
