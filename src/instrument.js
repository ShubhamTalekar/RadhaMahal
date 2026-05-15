import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [browserTracingIntegration()],
    // Capture 20% of transactions for performance monitoring
    tracesSampleRate: 0.2,
    // Only enable in production to avoid noise during development
    enabled: import.meta.env.PROD,
    environment: import.meta.env.MODE,
  });
  console.log('[Sentry] Frontend error tracking initialized.');
}
