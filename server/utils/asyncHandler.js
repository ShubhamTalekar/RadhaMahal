/**
 * Wraps an async route handler so that any thrown error is forwarded
 * to Express's next(err) error middleware — eliminating repetitive try/catch.
 *
 * Usage:
 *   router.post('/path', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
