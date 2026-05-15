import * as Sentry from '@sentry/node';

// Sentry must be initialized BEFORE any other imports
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 0.2,
        environment: process.env.NODE_ENV || 'development',
    });
    console.log('[Sentry] Backend error tracking initialized.');
}

import app from './app.js';
import { PORT, NODE_ENV } from './config/env.js';

app.listen(PORT, () => {
    console.log(`Radha Mahal - Shopify Concierge Bridge running on port ${PORT}`);
    console.log(`  Environment:   ${NODE_ENV}`);
    console.log(`  Contact Sync   → Shopify Admin API (Customers)`);
    console.log(`  Order Tracking → Shopify Admin API (Orders)`);
});
