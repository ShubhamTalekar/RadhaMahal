export const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    IS_PRODUCTION: import.meta.env.PROD,
};

if (config.IS_PRODUCTION && !config.API_BASE_URL) {
    throw new Error('CRITICAL ERROR: Missing VITE_API_BASE_URL in production environment. Backend API calls will fail.');
}

// Fallback for development if not set
if (!config.API_BASE_URL) {
    config.API_BASE_URL = 'http://localhost:5001';
}
