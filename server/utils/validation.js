/**
 * Validates that all listed fields are non-empty strings.
 * Sends a 400 response and returns false on the first failure.
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
