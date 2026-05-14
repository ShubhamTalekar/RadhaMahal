import { createGmailTransporter, sendRestockEmails } from '../services/email.js';
import { validateFields } from '../utils/validation.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requestRestockNotification = asyncHandler(async (req, res) => {
    const { email, productId, variantId, productName } = req.body;
    if (!validateFields({ email, productId, productName }, res)) return;

    const transporter = createGmailTransporter();
    if (!transporter) {
        console.warn('[Restock] Gmail not configured.');
        return res.status(200).json({ success: true, message: 'Request noted (email not configured)' });
    }

    await sendRestockEmails(transporter, { email, productName, variantId });
    console.log(`[Restock] Emails sent for ${email}`);
    res.status(200).json({ success: true, message: 'Notification scheduled' });
});
