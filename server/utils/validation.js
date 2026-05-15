import { ZodError } from 'zod';

/**
 * Validate a request body against a Zod schema.
 * On success, returns the parsed (and coerced) data.
 * On failure, sends a 400 response with structured error messages and returns null.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {object} data - The raw request body
 * @param {import('express').Response} res - Express response object
 * @returns {object|null} Parsed data or null if validation failed (response already sent)
 */
export function validate(schema, data, res) {
    try {
        return schema.parse(data);
    } catch (err) {
        if (err instanceof ZodError) {
            const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            res.status(400).json({
                success: false,
                message: messages[0],          // Primary error for simple consumers
                errors: messages,              // All errors for detailed consumers
            });
            return null;
        }
        throw err;
    }
}

/**
 * Legacy helper — validates that all listed fields are non-empty strings.
 * Prefer `validate()` with a Zod schema for new code.
 * @deprecated Use validate() with Zod schemas instead
 */
export function validateFields(fields, res) {
    for (const [key, val] of Object.entries(fields)) {
        if (!val || typeof val !== 'string' || !val.trim()) {
            res.status(400).json({ success: false, message: `Missing required field: ${key}` });
            return false;
        }
    }
    return true;
}
