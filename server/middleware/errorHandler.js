import pino from 'pino';

const logger = pino({ name: 'error-handler' });

/**
 * Central Express error handler.
 * Mount LAST with: app.use(errorHandler)
 *
 * Catches errors forwarded via next(err) or thrown inside asyncHandler wrappers.
 */
export function errorHandler(err, req, res, _next) { // eslint-disable-line no-unused-vars
    const status = err.status || 500;
    logger.error({ err, method: req.method, path: req.path, status }, `${req.method} ${req.path} → ${err.message}`);
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
    });
}
