import { findCustomerByEmail, createCustomer, updateCustomer } from '../services/shopify.js';
import { createGmailTransporter, sendConsultationEmails } from '../services/email.js';
import { validate } from '../utils/validation.js';
import { consultationSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const submitConsultation = asyncHandler(async (req, res) => {
    const parsed = validate(consultationSchema, req.body, res);
    if (!parsed) return;
    const { name, email, phone, date, time } = parsed;
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const noteText  = `[${timestamp}] Video Consultation Request\nDate: ${date}\nTime: ${time}\nPhone: ${phone}`;

    const existing = await findCustomerByEmail(email);
    if (existing) {
        const updatedNote = existing.note ? `${existing.note}\n\n---\n\n${noteText}` : noteText;
        const updatedTags = existing.tags?.includes('Video-Consultation') ? existing.tags : `${existing.tags || ''}, Video-Consultation`.replace(/^, /, '');
        await updateCustomer(existing.id, { note: updatedNote, tags: updatedTags, phone: existing.phone || phone });
        console.log(`[Consultation] Updated customer: ${email}`);
    } else {
        const parts = name.split(' ');
        await createCustomer({ first_name: parts[0], last_name: parts.slice(1).join(' ') || 'Patron', email, phone, note: noteText, tags: 'Video-Consultation', accepts_marketing: false, send_email_welcome: false });
        console.log(`[Consultation] Created customer: ${email}`);
    }

    const transporter = createGmailTransporter();
    if (transporter) {
        try { await sendConsultationEmails(transporter, { name, email, phone, date, time }); console.log(`[Consultation] Emails sent for ${email}`); }
        catch (e) { console.error('[Consultation] Gmail error:', e.message); }
    } else { console.warn('[Consultation] Gmail not configured.'); }

    res.status(200).json({ success: true, message: 'Consultation requested successfully.', previews: [] });
});
