import { createGmailTransporter, sendRestockEmails } from '../services/email.js';
import { validate } from '../utils/validation.js';
import { restockSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requestRestockNotification = asyncHandler(async (req, res) => {
    const parsed = validate(restockSchema, req.body, res);
    if (!parsed) return;
    const { email, productId, variantId, productName } = parsed;

    const transporter = createGmailTransporter();
    if (!transporter) {
        console.warn('[Restock] Gmail not configured.');
        return res.status(200).json({ success: true, message: 'Request noted (email not configured)' });
    }

    await sendRestockEmails(transporter, { email, productName, variantId });
    console.log(`[Restock] Emails sent for ${email}`);
    res.status(200).json({ success: true, message: 'Notification scheduled' });
});
