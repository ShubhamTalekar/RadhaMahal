import rateLimit from 'express-rate-limit';

// General handler for rate limit violations
const limitHandler = (req, res, next, options) => {
    res.status(options.statusCode).json({
        success: false,
        message: options.message,
    });
};

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many login attempts, please try again after 15 minutes',
    handler: limitHandler,
});

export const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many contact requests, please try again after 15 minutes',
    handler: limitHandler,
});

export const reviewsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many reviews submitted, please try again later',
    handler: limitHandler,
});

export const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many requests to admin APIs, please try again later',
    handler: limitHandler,
});
