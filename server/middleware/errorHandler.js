/**
 * Central Express error handler.
 * Mount LAST with: app.use(errorHandler)
 *
 * Catches errors forwarded via next(err) or thrown inside asyncHandler wrappers.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    const status = err.status || 500;
    console.error(`[Error] ${req.method} ${req.path} →`, err.message || err);
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
    });
}
