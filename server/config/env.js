import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load order matters: .env.local is the Vite convention for local developer overrides.
// By loading it first, any value it defines wins over the committed .env defaults.
// This means developers can set secrets in .env.local without touching the repo file.
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD not set');
}

export const PORT                 = process.env.PORT || 5001;
export const NODE_ENV             = process.env.NODE_ENV || 'development';

const rawCorsOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGINS || 'https://radhamahal.com,https://radhamahal.onrender.com').split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Always append the known live domains to prevent lockouts if the env var was overridden manually
export const CORS_ORIGINS = [...new Set([...rawCorsOrigins, 'https://www.radhamahalbyneha.in', 'https://radhamahalbyneha.in', 'https://radhamahal.onrender.com'])];

export const SHOPIFY_DOMAIN       = process.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
export const SHOPIFY_ADMIN_TOKEN  = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
export const SHOPIFY_API_VERSION  = process.env.VITE_SHOPIFY_API_VERSION || '2025-01';
export const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
export const EMADMIN_EMAIL        = process.env.EMADMIN_EMAIL;
export const EMAIL_PASS           = process.env.EMAIL_PASS;

export const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD || 'admin';
export const JWT_SECRET           = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_me';
export const SENTRY_DSN           = process.env.SENTRY_DSN;
