import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import timeout from 'connect-timeout';

// Config & Utils
import { PORT, CORS_ORIGINS, NODE_ENV } from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import './utils/store.js'; // Ensure store is bootstrapped

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security: Trust proxy (for Render/Railway/Cloudflare)
app.set('trust proxy', 1);

// Security: Timeout requests after 15s to prevent slowloris
app.use(timeout('15s'));

// Security: Helmet headers
app.use(helmet());

// Logging: Pino HTTP logger
app.use(pinoHttp({
    autoLogging: {
        ignore: req => req.url.includes('/assets/') || req.url === '/favicon.ico',
    },
}));

// Security: CORS whitelist
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (CORS_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

// Security: Limit payload sizes to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Serve static user uploads safely
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

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

// Global error handler must be mounted last
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Radha Mahal - Shopify Concierge Bridge running on port ${PORT}`);
    console.log(`  Environment:   ${NODE_ENV}`);
    console.log(`  Contact Sync   → Shopify Admin API (Customers)`);
    console.log(`  Order Tracking → Shopify Admin API (Orders)`);
});
