import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

/**
 * Validates that the request has a valid admin JWT.
 *
 * Token resolution order:
 *   1. HttpOnly cookie `admin_token` (primary — XSS-safe)
 *   2. Authorization: Bearer <token> header (fallback for Postman / programmatic callers)
 */
export function verifyAdmin(req, res, next) {
    // 1. Try HttpOnly cookie first (set by adminLogin)
    let token = req.cookies?.admin_token;

    // 2. Fall back to Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Missing authentication' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden - Insufficient privileges' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid or expired token' });
    }
}

/**
 * Validates that the request has a valid customer JWT (set via customerLogin).
 * Attaches decoded payload to req.customer.
 */
export function verifyCustomer(req, res, next) {
    const token = req.cookies?.customer_token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }
        req.customer = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Session expired. Please log in again.' });
    }
}
