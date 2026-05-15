# Radha Mahal RUNBOOK

## 🚨 Incident Response & Rollbacks

This document covers common production scenarios for the Radha Mahal platform hosted on Render.

---

## 1. Rollback a Bad Deployment

Render supports one-click rollbacks to any previous successful build.

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Select the `radha-mahal` **Web Service**.
3. Go to the **Events** or **Deploys** tab.
4. Find the last known-good deployment (look for "Deploy live" before the incident).
5. Click the `⋯` menu → **Rollback to this deploy**.

Render will instantly swap the running container with the prior build image. No rebuild is required — it's instant.

**Verify:** Visit your production URL and confirm the site loads. Check the **Logs** tab for any crash loops.

---

## 2. Restart the Server

### On Render (production)
1. Go to the Render Dashboard → `radha-mahal` Web Service.
2. Click the **Manual Deploy** button → **Deploy latest commit** to trigger a fresh start, or
3. Use the **Restart** option (Render plans that support it) for a hot restart without rebuilding.

### Locally (development)
```bash
# Stop the running process (Ctrl+C) then:
npm run dev:all

# Or restart only the backend:
npm run server
```

### With PM2 (production-like local or VPS)
```bash
pm2 restart radha-mahal-backend
pm2 logs radha-mahal-backend   # tail logs
pm2 status                      # check all processes
```

---

## 3. Rotate the Shopify Admin API Token

If the `SHOPIFY_ADMIN_ACCESS_TOKEN` is compromised or expired:

1. Log in to [Shopify Partners](https://partners.shopify.com) → Your App → **API credentials**.
2. Under **Admin API access tokens**, click **Rotate token**.
3. Copy the new `shpat_…` token.
4. On Render: **Web Service** → **Environment** → update `SHOPIFY_ADMIN_ACCESS_TOKEN` → **Save Changes**.
5. Render will automatically redeploy with the new token.
6. Update your local `server/.env` and `.env.local` with the new value.

**Verify:** Hit `GET /api/v1/api/admin/dashboard` (with a valid admin JWT) and confirm it returns `200 ok`.

---

## 4. Rotate the Shopify Webhook Secret

1. In Shopify Admin → **Settings** → **Notifications** → **Webhooks**.
2. Delete the existing `inventory_levels/update` webhook and recreate it to obtain a new signing secret.
3. Update `SHOPIFY_WEBHOOK_SECRET` in Render environment variables.
4. Update local `.env.local`.

---

## 5. Rotate the Gmail App Password (Nodemailer)

1. Go to [Google Account → App Passwords](https://myaccount.google.com/apppasswords).
2. Delete the old app password and create a new one named `Radha Mahal`.
3. Update `EMAIL_PASS` in Render environment variables.
4. Update local `.env.local`.

**Verify:** Submit a contact form and confirm an email arrives.

---

## 6. Database Issues (Supabase)

- **Corrupt review data:** Open the Supabase dashboard → **Table Editor** → `store_data`. Find the row with `id = 'reviewsStore'` and edit the `data` column directly.
- **Corrupt banner config:** Same as above but `id = 'bannerConfig'`. The default values are documented in `server/utils/store.js`.
- **Point-in-time recovery:** Available on Supabase Pro plans under **Database → Backups**.

---

## 7. High Error Rate / Server Crash Loop

1. Check **Render Logs** for repeated exceptions or `OOM` (Out of Memory) errors.
2. If a specific recent commit is causing crashes, perform a **Rollback** (see §1).
3. If memory is the issue, consider upgrading the Render instance type.
4. For PM2-managed deployments, run:
   ```bash
   pm2 logs radha-mahal-backend --lines 100
   pm2 monit   # live CPU/memory dashboard
   ```

---

## 8. Uptime Alerts

Configure an uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com) free tier) to ping:

```
GET https://your-domain.onrender.com/healthz
```

Expected response: `{"status":"ok","ts":1234567890}`  
Alert threshold: any non-200 response or timeout > 10s.

For error rate alerts, configure a **Sentry Alert Rule**:
- **Condition:** `Number of events is more than 5 in 1 hour`
- **Action:** Send email to `care@radhamahal.com`
