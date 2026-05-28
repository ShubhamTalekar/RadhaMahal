-- ═══════════════════════════════════════════════════════════════════════════════
-- Radha Mahal — Supabase Schema
-- Run this entire file in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── store_data ─────────────────────────────────────────────────────────────
-- Key-value store for server-managed config (reviews, banner, etc.)

CREATE TABLE IF NOT EXISTS store_data (
    id         TEXT PRIMARY KEY,
    data       JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial values (safe to re-run)
INSERT INTO store_data (id, data)
VALUES ('reviewsStore', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO store_data (id, data)
VALUES ('bannerConfig', '{
    "titlePrefix": "Wedding &",
    "titleHighlight": "Festive Collection 2025",
    "description": "Make every celebration unforgettable with our exclusive festive collection. Curated designs perfect for weddings, Diwali, and special occasions.",
    "buttonText": "Shop Festive Collection",
    "discountNum": "Up to 30%",
    "discountLabel": "Festive Discount",
    "designsNum": "100+",
    "designsLabel": "Approx. New Designs",
    "imageUrl": "https://images.unsplash.com/photo-1756483510767-35245638c057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "badgeTitle": "SALE",
    "badgeLabel": "Limited Time",
    "marqueeText": "Free shipping all over Maharashtra"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- ─── pgcrypto (needed for bcrypt hashing) ───────────────────────────────────
-- Already enabled on all Supabase projects by default.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ─── users ──────────────────────────────────────────────────────────────────
-- Stores admin accounts (with bcrypt password_hash) and Shopify customers.

CREATE TABLE IF NOT EXISTS users (
    id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
    email               TEXT    UNIQUE NOT NULL,
    password_hash       TEXT,                              -- bcrypt; only for admin accounts
    role                TEXT    NOT NULL DEFAULT 'customer'
                        CHECK (role IN ('admin', 'customer')),
    first_name          TEXT,
    last_name           TEXT,
    phone               TEXT,                              -- customer phone number
    addresses           JSONB   DEFAULT '[]'::jsonb,       -- saved delivery addresses
    photo_url           TEXT,                              -- profile photo URL
    shopify_customer_id BIGINT,                            -- Shopify numeric customer ID
    shopify_data        JSONB   DEFAULT '{}'::jsonb,       -- cached Shopify metadata / tags
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-refresh updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row-Level Security: the frontend (anon key) can NEVER read/write this table.
-- Only the server (service-role key) can access it.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Useful index for the login query (email lookup)
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_shopify_id_idx ON users (shopify_customer_id);


-- ─── Seed admin credentials ──────────────────────────────────────────────────
-- Default admin password is 'admin' (bcrypt cost 10).
-- To change it: UPDATE users SET password_hash = crypt('newpassword', gen_salt('bf', 10))
--               WHERE email = 'admin@radhamahal.com';
INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES (
    'admin@radhamahal.com',
    crypt('admin', gen_salt('bf', 10)),
    'admin',
    'Admin',
    'Radha Mahal'
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role          = EXCLUDED.role,
    updated_at    = NOW();
