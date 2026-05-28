const getApiBaseUrl = () => {
    const envVal = import.meta.env.VITE_API_BASE_URL;
    if (envVal && !envVal.includes('localhost') && !envVal.includes('127.0.0.1')) {
        return envVal.replace(/['"]/g, ''); // strip any accidentally included quotes
    }
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5001';
        }
    }
    return 'https://radhamahal.onrender.com';
};

export const config = {
    API_BASE_URL: getApiBaseUrl(),
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    IS_PRODUCTION: import.meta.env.PROD,
};
