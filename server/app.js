import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import timeout from 'connect-timeout';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

// Config & Utils
import { CORS_ORIGINS, NODE_ENV } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security: Trust proxy (for Render/Railway/Cloudflare)
app.set('trust proxy', 1);

// Security: Timeout requests after 15s to prevent slowloris
app.use(timeout('15s'));

// Security: Helmet headers (disable CSP to allow Vite/Cloudflare inline scripts)
app.use(helmet({ contentSecurityPolicy: false }));

// Logging: Pino HTTP logger
app.use(pinoHttp({
    autoLogging: {
        ignore: req => req.url.includes('/assets/') || req.url === '/favicon.ico',
    },
}));

// Security: CORS whitelist — credentials: true needed for HttpOnly admin cookie
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (CORS_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Security: Limit payload sizes to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Parse cookies (needed for HttpOnly admin JWT)
app.use(cookieParser());

// Serve static user uploads safely
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// Health check — load balancers and uptime monitors hit this
app.get('/healthz', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// API docs — only in non-production to avoid exposing the full API surface publicly.
// In production, access the raw spec via authenticated means or use a local dev build.
if (NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Radha Mahal API Docs',
    }));
    // Serve raw OpenAPI JSON for tooling (Postman import, etc.)
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
}

// Register all modular routes under /api/v1/
const apiRouter = express.Router();
registerRoutes(apiRouter);
app.use('/api/v1', apiRouter);

// ─── PRODUCTION START INDICATOR & FRONTEND SERVING ────────────────────────────
if (NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, '../dist'))) {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
}

// Sentry error handler must come BEFORE our custom error handler
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}

// Global error handler must be mounted last
app.use(errorHandler);

export default app;
