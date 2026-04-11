import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import fs from 'fs';

// ─── Gmail Transporter Helper ─────────────────────────────────────────────────
function createGmailTransporter() {
    const adminEmail = process.env.EMADMIN_EMAIL;
    const emailPass  = process.env.EMAIL_PASS;
    if (!adminEmail || !emailPass) return null;
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: adminEmail, pass: emailPass }
    });
}

const SHOPIFY_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION || '2025-01';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first (Vite convention), then fall back to .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// Persistent JSON store
const DB_FILE = path.resolve(__dirname, 'store.json');
let initialReviewsStore = {};

if (fs.existsSync(DB_FILE)) {
    try {
        const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        initialReviewsStore = parsed.reviewsStore || {};
    } catch (err) {
        console.error('Error reading store.json', err);
    }
}

// In-memory runtime instances
const reviewsStore = initialReviewsStore;

function persistStore() {
    fs.writeFileSync(DB_FILE, JSON.stringify({ reviewsStore }, null, 2));
}

function validateFields(fields, res) {
  for (const [key, val] of Object.entries(fields)) {
    if (!val || typeof val !== 'string' || !val.trim()) {
      res.status(400).json({ success: false, message: `Missing required field: ${key}` });
      return false;
    }
  }
  return true;
}

// Simple HTML escape for untrusted input in email templates
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function verifyShopifyWebhook(req, res, next) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmac) return res.status(401).json({ error: 'Unauthorized' });

  const digest = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('base64');

  if (digest !== hmac) return res.status(401).json({ error: 'Invalid signature' });
  next();
}

// ─── Contact Inquiry → Shopify Customer ──────────────────────────────────────
//
// Creates or updates a Shopify customer record with the Contact-Inquiry tag
// and the patron's message as a Customer Note. Admins can then use
// Shopify Flow (Store > Automations) to send email notifications when a
// customer receives the "Contact-Inquiry" tag.
//
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!validateFields({ name, email, subject, message }, res)) return;

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });
    }

    const adminApiUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`;

    // Search first to avoid duplicate customers
    const searchUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`;

    try {
        const searchRes = await fetch(searchUrl, {
            headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN }
        });
        const searchData = await searchRes.json();
        const existingCustomer = searchData.customers?.[0];

        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const noteText = `[${timestamp}] Inquiry via Contact Form\nSubject: ${subject}\nMessage: ${message}`;

        if (existingCustomer) {
            // Append new inquiry to existing customer's note and re-tag
            const existingNote = existingCustomer.note || '';
            const updatedNote = existingNote
                ? `${existingNote}\n\n---\n\n${noteText}`
                : noteText;

            const existingTags = existingCustomer.tags || '';
            const updatedTags = existingTags.includes('Contact-Inquiry')
                ? existingTags
                : `${existingTags}, Contact-Inquiry`.replace(/^, /, '');

            await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${existingCustomer.id}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN
                },
                body: JSON.stringify({
                    customer: {
                        id: existingCustomer.id,
                        note: updatedNote,
                        tags: updatedTags
                    }
                })
            });

            console.log(`[Contact] Updated existing Shopify customer: ${email}`);
        } else {
            // Create a new customer record
            await fetch(adminApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN
                },
                body: JSON.stringify({
                    customer: {
                        first_name: name.split(' ')[0],
                        last_name: name.split(' ').slice(1).join(' ') || 'Patron',
                        email,
                        note: noteText,
                        tags: 'Contact-Inquiry',
                        accepts_marketing: false,
                        send_email_welcome: false
                    }
                })
            });

            console.log(`[Contact] Created new Shopify customer: ${email}`);
        }

        // ── Send emails via Gmail ──────────────────────────────────────────
        const transporter = createGmailTransporter();
        const adminEmail  = process.env.EMADMIN_EMAIL || '';
        if (transporter) {
            try {
                // Confirmation to customer
                await transporter.sendMail({
                    from: `"Radha Mahal By Neha" <${adminEmail}>`,
                    to: email,
                    subject: `We Received Your Inquiry — Radha Mahal Atelier`,
                    html: `
                        <p>Dear <b>${esc(name).split(' ')[0]}</b>,</p>
                        <p>Thank you for reaching out to Radha Mahal. We have received your inquiry regarding <b>${esc(subject)}</b> and our concierge will respond within 24 hours.</p>
                        <p><i>"${esc(message).slice(0, 120)}${message.length > 120 ? '…' : ''}"</i></p>
                        <p>Warm regards,<br/>Radha Mahal By Neha</p>
                    `
                });
                // Notification to admin
                await transporter.sendMail({
                    from: `"Radha Mahal Portal" <${adminEmail}>`,
                    to: adminEmail,
                    subject: `New Contact Inquiry: ${subject}`,
                    html: `
                        <p><b>New contact form submission</b></p>
                        <p><b>Name:</b> ${esc(name)}</p>
                        <p><b>Email:</b> ${esc(email)}</p>
                        <p><b>Subject:</b> ${esc(subject)}</p>
                        <p><b>Message:</b><br/>${esc(message).replace(/\n/g, '<br/>')}</p>
                    `
                });
                console.log(`[Contact] Emails sent via Gmail for ${email}`);
            } catch (mailErr) {
                console.error('[Contact] Gmail send error:', mailErr.message);
            }
        } else {
            console.warn('[Contact] Gmail not configured — skipping email notifications.');
        }

        res.status(200).json({ success: true, message: 'Inquiry delivered to Shopify Atelier' });
    } catch (error) {
        console.error('[Contact] Shopify sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to deliver inquiry to Shopify' });
    }
});

// ─── Video Consultation Sync ──────────────────────────────────────────────────
// Maps consultation requests to customer profiles so Shopify Flow can trigger
// emails to both the admin and the customer using the "Video-Consultation" tag.
app.post('/api/consultation', async (req, res) => {
    const { name, email, phone, date, time } = req.body;
    if (!validateFields({ name, email, phone, date, time }, res)) return;

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });
    }

    const adminApiUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`;
    const searchUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`;

    try {
        const searchRes = await fetch(searchUrl, { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } });
        const searchData = await searchRes.json();
        const existingCustomer = searchData.customers?.[0];

        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const noteText = `[${timestamp}] Video Consultation Request\nDate: ${date}\nTime: ${time}\nPhone: ${phone}`;

        if (existingCustomer) {
            const existingNote = existingCustomer.note || '';
            const updatedNote = existingNote ? `${existingNote}\n\n---\n\n${noteText}` : noteText;

            const existingTags = existingCustomer.tags || '';
            const updatedTags = existingTags.includes('Video-Consultation') ? existingTags : `${existingTags}, Video-Consultation`.replace(/^, /, '');

            await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${existingCustomer.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                body: JSON.stringify({ customer: { id: existingCustomer.id, note: updatedNote, tags: updatedTags, phone: existingCustomer.phone || phone } })
            });
            console.log(`[Consultation] Updated Shopify customer: ${email}`);
        } else {
            await fetch(adminApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                body: JSON.stringify({
                    customer: {
                        first_name: name.split(' ')[0],
                        last_name: name.split(' ').slice(1).join(' ') || 'Patron',
                        email,
                        phone,
                        note: noteText,
                        tags: 'Video-Consultation',
                        accepts_marketing: false,
                        send_email_welcome: false
                    }
                })
            });
            console.log(`[Consultation] Created Shopify customer: ${email}`);
        }

        // ── Send emails via Gmail ──────────────────────────────────────────
        const transporter = createGmailTransporter();
        const adminEmail  = process.env.EMADMIN_EMAIL || '';
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"Radha Mahal By Neha" <${adminEmail}>`,
                    to: email,
                    subject: `Your Styling Session Request — Radha Mahal Atelier`,
                    html: `
                        <p>Dear <b>${esc(name).split(' ')[0]}</b>,</p>
                        <p>Your video consultation request has been received for <b>${esc(date)}</b> at <b>${esc(time)}</b>.</p>
                        <p>Our stylist will confirm your session and send a calendar invite shortly.</p>
                        <p>Warm regards,<br/>Radha Mahal By Neha</p>
                    `
                });
                await transporter.sendMail({
                    from: `"Radha Mahal Portal" <${adminEmail}>`,
                    to: adminEmail,
                    subject: `New Consultation Booking: ${name}`,
                    html: `
                        <p><b>New consultation booking</b></p>
                        <p><b>Name:</b> ${esc(name)}</p>
                        <p><b>Email:</b> ${esc(email)}</p>
                        <p><b>Phone:</b> ${esc(phone)}</p>
                        <p><b>Date:</b> ${esc(date)} at ${esc(time)}</p>
                    `
                });
                console.log(`[Consultation] Emails sent via Gmail for ${email}`);
            } catch (mailErr) {
                console.error('[Consultation] Gmail send error:', mailErr.message);
            }
        } else {
            console.warn('[Consultation] Gmail not configured — skipping email notifications.');
        }

        res.status(200).json({ 
            success: true, 
            message: 'Consultation requested successfully.',
            previews: []
        });
    } catch (error) {
        console.error('[Consultation] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit consultation request.' });
    }
});

// ─── Google Auth Sync ──────────────────────────────────────────────────────────
//
// Ensures that Google authenticated users exist as Shopify customers
// so their order history can be tracked and managed by the Atelier.
//
app.post('/api/gauth/sync', async (req, res) => {
    const { email, name } = req.body;

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });
    }

    const adminApiUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`;
    const searchUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`;

    try {
        const searchRes = await fetch(searchUrl, {
            headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN }
        });
        const searchData = await searchRes.json();
        const existingCustomer = searchData.customers?.[0];

        if (existingCustomer) {
            console.log(`[Google Auth] Shopify customer already exists: ${email}`);
            return res.status(200).json({ success: true, message: 'Existing customer synced', shopifyId: existingCustomer.id });
        }

        if (req.body.action === 'login') {
            console.log(`[Google Auth] Rejected unknown login attempt for: ${email}`);
            return res.status(401).json({ success: false, message: 'Customer not found. Please Request an Invitation to create your profile.' });
        }

        // Create new customer
        const nameParts = name ? name.split(' ') : ['Google', 'Patron'];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'Patron';

        const createRes = await fetch(adminApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN
            },
            body: JSON.stringify({
                customer: {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    tags: 'Google-Auth',
                    verified_email: true,
                    send_email_welcome: false
                }
            })
        });

        const createData = await createRes.json();
        
        if (!createRes.ok) {
            console.error('[Google Auth] Shopify customer creation failed:', createData);
            return res.status(createRes.status).json({ success: false, message: 'Failed to create Shopify customer' });
        }

        console.log(`[Google Auth] Created new Shopify customer: ${email}`);
        res.status(200).json({ success: true, message: 'Shopify customer created', shopifyId: createData.customer.id });

    } catch (error) {
        console.error('[Google Auth] Sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync Google user with Shopify' });
    }
});

// ─── Wishlist Sync ────────────────────────────────────────────────────────────
//
// Stores the customer's wishlist as a Shopify Customer Metafield (JSON)
// under namespace: radha_mahal / key: wishlist
// Visible in Shopify Admin → Customers → [customer] → Metafields
//
app.post('/api/wishlist/sync', async (req, res) => {
    const { email, wishlist } = req.body;
    if (!validateFields({ email }, res)) return;
    if (!Array.isArray(wishlist)) return res.status(400).json({ success: false, message: 'Invalid wishlist data' });

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });
    }

    const searchUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`;

    try {
        const searchRes = await fetch(searchUrl, {
            headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN }
        });
        const searchData = await searchRes.json();
        let customer = searchData.customers?.[0];

        // Auto-create Shopify customer if not found
        if (!customer) {
            console.log(`[Wishlist Sync] Customer not found — creating: ${email}`);
            const nameParts = (email.split('@')[0] || 'Patron').split(/[._]/);
            const firstName = nameParts[0] || 'Radha';
            const lastName  = nameParts.slice(1).join(' ') || 'Mahal Patron';
            const createRes = await fetch(
                `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                    body: JSON.stringify({
                        customer: {
                            first_name: firstName,
                            last_name:  lastName,
                            email,
                            verified_email: true,
                            send_email_welcome: false
                        }
                    })
                }
            );
            if (!createRes.ok) {
                const errText = await createRes.text();
                console.error('[Wishlist Sync] Failed to create customer, status', createRes.status, errText);
                return res.status(500).json({ success: false, message: 'Could not create Shopify customer' });
            }
            const createData = await createRes.json();
            customer = createData.customer;
            if (!customer) {
                console.error('[Wishlist Sync] Failed to create customer:', createData);
                return res.status(500).json({ success: false, message: 'Could not create Shopify customer' });
            }
        }

        const customerId = customer.id;
        const metafieldsUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}/metafields.json`;

        // Check if wishlist metafield already exists
        const existingMfRes  = await fetch(
            `${metafieldsUrl}?namespace=radha_mahal&key=wishlist`,
            { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } }
        );
        const existingMfData = await existingMfRes.json();
        const existingMf     = existingMfData.metafields?.[0];

        const wishlistPayload = wishlist.map(i => ({
            id:    String(i.id),
            title: i.title,
            price: i.final_price || i.price,
            image: i.image || '',
            category: i.category || ''
        }));

        if (existingMf) {
            // Update existing metafield
            await fetch(
                `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}/metafields/${existingMf.id}.json`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                    body: JSON.stringify({ metafield: { id: existingMf.id, value: JSON.stringify(wishlistPayload), type: 'json' } })
                }
            );
        } else {
            // Create new metafield
            await fetch(metafieldsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                body: JSON.stringify({
                    metafield: {
                        namespace: 'radha_mahal',
                        key:       'wishlist',
                        value:     JSON.stringify(wishlistPayload),
                        type:      'json'
                    }
                })
            });
        }

        console.log(`[Wishlist Sync] Metafield updated for ${email} (${wishlistPayload.length} items)`);

        // ── Also write human-readable summary to customer Note ────────────────
        const existingNote       = customer.note || '';
        const noteWithoutWishlist = existingNote.replace(/\n\n=== WISHLIST ===[^\0]*$/, '').trimEnd();
        const wishlistNote       = wishlistPayload.length > 0
            ? `\n\n=== WISHLIST ===\n${wishlistPayload.map(i => `- ${i.title} (₹${Number(i.price).toLocaleString('en-IN')})`).join('\n')}`
            : '';
        const finalNote = (noteWithoutWishlist + wishlistNote).trim();

        await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
            body: JSON.stringify({ customer: { id: customerId, note: finalNote } })
        });

        console.log(`[Wishlist Sync] Note updated for ${email}`);
        res.status(200).json({ success: true, message: 'Wishlist synced to Shopify metafield & note' });

    } catch (error) {
        console.error('[Wishlist Sync] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync wishlist' });
    }
});

// ─── Bag Sync ──────────────────────────────────────────────────────────────────
// Syncs the shopping bag state to Shopify Customer Metafields
app.post('/api/bag/sync', async (req, res) => {
    const { email, bag } = req.body;
    if (!validateFields({ email }, res)) return;
    if (!Array.isArray(bag)) return res.status(400).json({ success: false, message: 'Invalid bag data' });

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ success: false, message: 'Shopify Admin token not configured.' });
    }

    const searchUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`;

    try {
        const searchRes = await fetch(searchUrl, {
            headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN }
        });
        const searchData = await searchRes.json();
        let customer = searchData.customers?.[0];

        if (!customer) {
            console.log(`[Bag Sync] Customer not found — creating: ${email}`);
            const nameParts = (email.split('@')[0] || 'Patron').split(/[._]/);
            const createRes = await fetch(
                `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                    body: JSON.stringify({
                        customer: {
                            first_name: nameParts[0] || 'Radha',
                            last_name:  nameParts.slice(1).join(' ') || 'Mahal Patron',
                            email,
                            verified_email: true,
                            send_email_welcome: false
                        }
                    })
                }
            );
            const createData = await createRes.json();
            customer = createData.customer;
            if (!customer) throw new Error('Could not create Shopify customer');
        }

        const customerId = customer.id;
        const metafieldsUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}/metafields.json`;

        const existingMfRes = await fetch(
            `${metafieldsUrl}?namespace=radha_mahal&key=bag`,
            { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } }
        );
        const existingMfData = await existingMfRes.json();
        const existingMf = existingMfData.metafields?.[0];

        const bagPayload = bag.map(i => ({
            id: String(i.id),
            title: i.title,
            price: i.final_price || i.price,
            image: i.image || '',
            category: i.category || ''
        }));

        if (existingMf) {
            await fetch(
                `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}/metafields/${existingMf.id}.json`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                    body: JSON.stringify({ metafield: { id: existingMf.id, value: JSON.stringify(bagPayload), type: 'json' } })
                }
            );
        } else {
            await fetch(metafieldsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
                body: JSON.stringify({
                    metafield: {
                        namespace: 'radha_mahal',
                        key: 'bag',
                        value: JSON.stringify(bagPayload),
                        type: 'json'
                    }
                })
            });
        }

        console.log(`[Bag Sync] Metafield updated for ${email} (${bagPayload.length} items)`);
        res.status(200).json({ success: true, message: 'Bag synced to Shopify metafield' });

    } catch (error) {
        console.error('[Bag Sync] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync bag' });
    }
});

// ─── Out-of-Stock Webhook ──────────────────────────────────────────────────────
// Register this in Shopify Admin → Settings → Notifications → Webhooks:
//   Topic: inventory_levels/update
//   URL:   https://your-domain.com/api/webhooks/inventory-update
app.post('/api/webhooks/inventory-update', verifyShopifyWebhook, async (req, res) => {
    const { available, inventory_item_id, product_title } = req.body;

    // Only act when stock reaches exactly 0
    if (available > 0) return res.status(200).json({ skipped: true });

    console.log(`[OOS] Stock hit 0 — inventory_item_id: ${inventory_item_id}, title hint: ${product_title}`);

    try {
        // ── Resolve product title from Shopify if not provided ──────────────────
        let productTitle = product_title || '';
        let productId    = '';
        if (inventory_item_id && SHOPIFY_ADMIN_TOKEN) {
            const variantSearch = await fetch(
                `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/variants.json?inventory_item_ids=${inventory_item_id}&limit=1`,
                { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } }
            );
            const variantData = await variantSearch.json();
            const variant = variantData.variants?.[0];
            if (variant) {
                productId = String(variant.product_id);
                // Fetch product title
                const prodRes = await fetch(
                    `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${variant.product_id}.json?fields=id,title`,
                    { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } }
                );
                const prodData = await prodRes.json();
                productTitle = prodData.product?.title || productTitle;
            }
        }

        if (!productTitle && !productId) {
            console.warn('[OOS] Could not resolve product — skipping notifications.');
            return res.status(200).json({ skipped: true });
        }

        console.log(`[OOS] Product "${productTitle}" (id: ${productId}) is now out of stock.`);

        // ── Collect affected emails ─────────────────────────────────────────────
        const emailsToNotify = new Set();

        // Scan Shopify customers whose bag or wishlist metafield contains the product ID
        if (productId && SHOPIFY_ADMIN_TOKEN) {
            let page = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json?limit=250&fields=id,email`;
            while (page) {
                const custRes = await fetch(page, { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } });
                const custData = await custRes.json();
                
                await Promise.all((custData.customers || []).map(async (c) => {
                    if (!c.email) return;
                    const mfRes = await fetch(
                        `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${c.id}/metafields.json?namespace=radha_mahal`,
                        { headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN } }
                    );
                    const mfData = await mfRes.json();
                    const metafields = mfData.metafields || [];
                    
                    let foundMatch = false;

                    for (const mf of metafields) {
                        if (mf.key === 'wishlist' || mf.key === 'bag') {
                            try {
                                const items = JSON.parse(mf.value);
                                if (Array.isArray(items) && items.some(i => String(i.id) === productId)) {
                                    foundMatch = true;
                                }
                            } catch {}
                        }
                    }

                    if (foundMatch) {
                         emailsToNotify.add(c.email);
                         console.log(`[OOS] Bag/Wishlist match (metafield): ${c.email}`);
                    }
                }));
                
                const linkHeader = custRes.headers.get('Link') || '';
                const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                page = nextMatch ? nextMatch[1] : null;
            }
        }

        if (emailsToNotify.size === 0) {
            console.log('[OOS] No users to notify.');
            return res.status(200).json({ notified: 0 });
        }

        // ── Send emails ─────────────────────────────────────────────────────────
        const transporter = createGmailTransporter();
        const adminEmail  = process.env.EMADMIN_EMAIL || '';
        if (!transporter) {
            console.warn('[OOS] Gmail not configured — cannot send notifications.');
            return res.status(200).json({ notified: 0, error: 'email not configured' });
        }

        const sendPromises = [...emailsToNotify].map(email =>
            transporter.sendMail({
                from: `"Radha Mahal By Neha" <${adminEmail}>`,
                to: email,
                subject: `${productTitle} — Now Sold Out`,
                html: `
                    <p>Dear Patron,</p>
                    <p>We regret to inform you that <b>${productTitle}</b>, which you had saved in your Wishlist or Shopping Bag, has just sold out.</p>
                    <p>As a valued member of the Radha Mahal Atelier, you may wish to request a restock alert or explore our latest arrivals.</p>
                    <p>We will notify you the moment this piece is available again.</p>
                    <p>Warm regards,<br/>Radha Mahal By Neha</p>
                `
            }).then(() => console.log(`[OOS] Email sent to ${email}`))
              .catch(err => console.error(`[OOS] Failed to email ${email}:`, err.message))
        );

        await Promise.all(sendPromises);
        res.status(200).json({ success: true, notified: emailsToNotify.size });

    } catch (err) {
        console.error('[OOS] Webhook error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Live Order Tracking ──────────────────────────────────────────────────────
app.get('/api/user/orders/:email', async (req, res) => {
    const { email } = req.params;
    const adminApiUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?email=${email}&status=any`;

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ error: 'Shopify Admin Token not configured' });
    }

    try {
        const response = await fetch(adminApiUrl, {
            headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN }
        });
        const data = await response.json();

        const orders = data.orders.map(order => ({
            id: order.order_number,
            shopifyId: order.id,
            date: new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            total: parseFloat(order.total_price),
            status: order.fulfillment_status || 'Processing',
            items: order.line_items.map(item => ({
                id: item.product_id,
                title: item.title,
                quantity: item.quantity,
                price: parseFloat(item.price),
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200&auto=format&fit=crop'
            })),
            tracking: order.fulfillments?.[0] ? {
                number: order.fulfillments[0].tracking_number,
                company: order.fulfillments[0].tracking_company,
                url: order.fulfillments[0].tracking_url
            } : null
        }));

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching Shopify orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders from Shopify' });
    }
});

// ─── Anonymous Order Tracking (By Order Number) ──────────────────────────────
app.get('/api/track/:orderNumber', async (req, res) => {
    let { orderNumber } = req.params;
    // Strip '#' if client sends it
    orderNumber = orderNumber.replace(/^#/, '').trim();
    
    // Shopify allows querying by name, e.g. name=1001 or name=#1001
    const adminApiUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?name=${orderNumber}&status=any`;

    if (!SHOPIFY_ADMIN_TOKEN) {
        return res.status(500).json({ error: 'Shopify Admin Token not configured' });
    }

    try {
        const response = await fetch(adminApiUrl, {
            headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN }
        });
        const data = await response.json();
        
        const order = data.orders?.[0]; // Get exactly matching order

        if (!order) {
            return res.status(404).json({ error: 'Order not found matching that code' });
        }

        const tracking = order.fulfillments?.[0] ? {
            number: order.fulfillments[0].tracking_number,
            company: order.fulfillments[0].tracking_company,
            url: order.fulfillments[0].tracking_url
        } : null;

        res.status(200).json({
            id: order.order_number,
            name: order.name,
            status: order.fulfillment_status || 'Processing',
            date: new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            tracking
        });
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        res.status(500).json({ error: 'Failed to fetch tracking details' });
    }
});

// ─── Restock Notification ────────────────────────────────────────────────────────
app.post('/api/restock-notification', async (req, res) => {
    const { email, productId, variantId, productName } = req.body;
    if (!validateFields({ email, productId, productName }, res)) return;
    
    try {
        const transporter = createGmailTransporter();
        const adminEmail  = process.env.EMADMIN_EMAIL || 'care@radhamahal.com';
        if (!transporter) {
            console.warn('[Restock] Gmail not configured — skipping email notifications.');
            return res.status(200).json({ success: true, message: 'Request noted (email not configured)' });
        }

        await transporter.sendMail({
            from: `"Radha Mahal Portal" <${adminEmail}>`,
            to: adminEmail,
            subject: `Restock Request: ${productName}`,
            html: `<p>A patron has requested a back-in-stock alert.</p><p><b>Product:</b> ${esc(productName)}</p><p><b>Variant ID:</b> ${esc(variantId || 'N/A')}</p><p><b>Notify Email:</b> ${esc(email)}</p>`
        });
        await transporter.sendMail({
            from: `"Radha Mahal By Neha" <${adminEmail}>`,
            to: email,
            subject: `Restock Alert Saved — Radha Mahal Atelier`,
            html: `<p>Thank you for your interest in <b>${esc(productName)}</b>.</p><p>You are officially on the waitlist! We will alert you the moment this masterpiece is back in our atelier.</p>`
        });
        console.log(`[Restock] Emails sent via Gmail for ${email}`);
        res.status(200).json({ success: true, message: 'Notification scheduled' });
    } catch (e) {
        console.error('[Restock] Error:', e);
        res.status(500).json({ success: false, message: 'Failed to schedule notification' });
    }
});

// ─── Product Reviews (Persistent Local Store) ─────────────────────────────────────────

app.get('/api/reviews/:productId', (req, res) => {
    const { productId } = req.params;
    res.json(reviewsStore[productId] || []);
});

app.post('/api/reviews/:productId', (req, res) => {
    const { productId } = req.params;
    const { author, rating, comment } = req.body;

    // Basic validation
    if (!author || !comment || !rating) {
        return res.status(400).json({ success: false, message: 'Missing review fields' });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }
    if (comment.length > 1000) {
        return res.status(400).json({ success: false, message: 'Comment too long' });
    }

    const safeReview = {
        author: esc(String(author).slice(0, 100)),
        rating: Math.round(rating),
        comment: esc(String(comment).slice(0, 1000)),
        date: new Date().toISOString()
    };

    if (!reviewsStore[productId]) reviewsStore[productId] = [];
    reviewsStore[productId].unshift(safeReview);
    persistStore();
    res.status(201).json({ success: true, review: safeReview });
});

app.listen(PORT, () => {
    console.log(`Radha Mahal - Shopify Concierge Bridge running on port ${PORT}`);
    console.log(`  Contact Sync  → Shopify Admin API (Customers)`);
    console.log(`  Order Tracking → Shopify Admin API (Orders)`);
});
