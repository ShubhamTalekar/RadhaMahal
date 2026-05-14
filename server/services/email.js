import nodemailer from 'nodemailer';
import { EMADMIN_EMAIL, EMAIL_PASS } from '../config/env.js';
import { esc } from '../utils/escape.js';

/** Creates a Gmail transporter, or returns null if credentials are missing */
export function createGmailTransporter() {
    if (!EMADMIN_EMAIL || !EMAIL_PASS) return null;
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMADMIN_EMAIL, pass: EMAIL_PASS },
    });
}

export async function sendContactEmails(transporter, { name, email, subject, message }) {
    const admin = EMADMIN_EMAIL || '';
    await transporter.sendMail({
        from: `"Radha Mahal By Neha" <${admin}>`,
        to:   email,
        subject: `We Received Your Inquiry — Radha Mahal Atelier`,
        html: `<p>Dear <b>${esc(name).split(' ')[0]}</b>,</p>
               <p>Thank you for reaching out to Radha Mahal. We have received your inquiry regarding <b>${esc(subject)}</b> and our concierge will respond within 24 hours.</p>
               <p><i>"${esc(message).slice(0, 120)}${message.length > 120 ? '…' : ''}"</i></p>
               <p>Warm regards,<br/>Radha Mahal By Neha</p>`,
    });
    await transporter.sendMail({
        from: `"Radha Mahal Portal" <${admin}>`,
        to:   admin,
        subject: `New Contact Inquiry: ${subject}`,
        html: `<p><b>New contact form submission</b></p>
               <p><b>Name:</b> ${esc(name)}</p>
               <p><b>Email:</b> ${esc(email)}</p>
               <p><b>Subject:</b> ${esc(subject)}</p>
               <p><b>Message:</b><br/>${esc(message).replace(/\n/g, '<br/>')}</p>`,
    });
}

export async function sendConsultationEmails(transporter, { name, email, phone, date, time }) {
    const admin = EMADMIN_EMAIL || '';
    await transporter.sendMail({
        from: `"Radha Mahal By Neha" <${admin}>`,
        to:   email,
        subject: `Your Styling Session Request — Radha Mahal Atelier`,
        html: `<p>Dear <b>${esc(name).split(' ')[0]}</b>,</p>
               <p>Your video consultation request has been received for <b>${esc(date)}</b> at <b>${esc(time)}</b>.</p>
               <p>Our stylist will confirm your session and send a calendar invite shortly.</p>
               <p>Warm regards,<br/>Radha Mahal By Neha</p>`,
    });
    await transporter.sendMail({
        from: `"Radha Mahal Portal" <${admin}>`,
        to:   admin,
        subject: `New Consultation Booking: ${name}`,
        html: `<p><b>New consultation booking</b></p>
               <p><b>Name:</b> ${esc(name)}</p>
               <p><b>Email:</b> ${esc(email)}</p>
               <p><b>Phone:</b> ${esc(phone)}</p>
               <p><b>Date:</b> ${esc(date)} at ${esc(time)}</p>`,
    });
}

export async function sendOOSEmails(transporter, emails, productTitle) {
    const admin = EMADMIN_EMAIL || '';
    await Promise.all([...emails].map(email =>
        transporter.sendMail({
            from: `"Radha Mahal By Neha" <${admin}>`,
            to:   email,
            subject: `${productTitle} — Now Sold Out`,
            html: `<p>Dear Patron,</p>
                   <p>We regret to inform you that <b>${productTitle}</b>, which you had saved in your Wishlist or Shopping Bag, has just sold out.</p>
                   <p>We will notify you the moment this piece is available again.</p>
                   <p>Warm regards,<br/>Radha Mahal By Neha</p>`,
        })
        .then(() => console.log(`[OOS] Email sent to ${email}`))
        .catch(err => console.error(`[OOS] Failed to email ${email}:`, err.message))
    ));
}

export async function sendRestockEmails(transporter, { email, productName, variantId }) {
    const admin = EMADMIN_EMAIL || '';
    await transporter.sendMail({
        from: `"Radha Mahal Portal" <${admin}>`,
        to:   admin,
        subject: `Restock Request: ${productName}`,
        html: `<p>A patron has requested a back-in-stock alert.</p>
               <p><b>Product:</b> ${esc(productName)}</p>
               <p><b>Variant ID:</b> ${esc(variantId || 'N/A')}</p>
               <p><b>Notify Email:</b> ${esc(email)}</p>`,
    });
    await transporter.sendMail({
        from: `"Radha Mahal By Neha" <${admin}>`,
        to:   email,
        subject: `Restock Alert Saved — Radha Mahal Atelier`,
        html: `<p>Thank you for your interest in <b>${esc(productName)}</b>.</p>
               <p>You are officially on the waitlist! We will alert you the moment this masterpiece is back in our atelier.</p>`,
    });
}
