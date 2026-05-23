import './instrument.js'; // Sentry — must be first
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.jsx';
import './lib/config.js'; // Validate environment on load

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HelmetProvider>
            <App />
            <Toaster position="bottom-center" richColors />
        </HelmetProvider>
    </StrictMode>
);
