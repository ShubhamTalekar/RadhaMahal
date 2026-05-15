import { findCustomerByEmail, createCustomer, updateCustomer } from '../services/shopify.js';
import { createGmailTransporter, sendContactEmails } from '../services/email.js';
import { validate } from '../utils/validation.js';
import { contactSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const submitContact = asyncHandler(async (req, res) => {
    const parsed = validate(contactSchema, req.body, res);
    if (!parsed) return;
    const { name, email, subject, message } = parsed;
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const noteText  = `[${timestamp}] Inquiry via Contact Form\nSubject: ${subject}\nMessage: ${message}`;

    const existing = await findCustomerByEmail(email);
    if (existing) {
        const updatedNote = existing.note ? `${existing.note}\n\n---\n\n${noteText}` : noteText;
        const updatedTags = existing.tags?.includes('Contact-Inquiry') ? existing.tags : `${existing.tags || ''}, Contact-Inquiry`.replace(/^, /, '');
        await updateCustomer(existing.id, { note: updatedNote, tags: updatedTags });
        console.log(`[Contact] Updated customer: ${email}`);
    } else {
        const parts = name.split(' ');
        await createCustomer({ first_name: parts[0], last_name: parts.slice(1).join(' ') || 'Patron', email, note: noteText, tags: 'Contact-Inquiry', accepts_marketing: false, send_email_welcome: false });
        console.log(`[Contact] Created customer: ${email}`);
    }

    const transporter = createGmailTransporter();
    if (transporter) {
        try { await sendContactEmails(transporter, { name, email, subject, message }); console.log(`[Contact] Emails sent for ${email}`); }
        catch (e) { console.error('[Contact] Gmail error:', e.message); }
    } else { console.warn('[Contact] Gmail not configured.'); }

    res.status(200).json({ success: true, message: 'Inquiry delivered to Shopify Atelier' });
});
