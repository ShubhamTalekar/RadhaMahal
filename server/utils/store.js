import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DB_FILE      = path.resolve(__dirname, '../store.json');
const EXAMPLE_FILE = path.resolve(__dirname, '../store.example.json');

// ─── Auto-bootstrap ──────────────────────────────────────────────────────────
// On first run (store.json missing), copy from store.example.json or create empty.
if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(EXAMPLE_FILE)) {
        fs.copyFileSync(EXAMPLE_FILE, DB_FILE);
        console.log('[Store] store.json created from store.example.json');
    } else {
        fs.writeFileSync(DB_FILE, JSON.stringify({ reviewsStore: {}, bannerConfig: null }, null, 2));
        console.log('[Store] store.json bootstrapped with defaults');
    }
}

// ─── Load initial state ───────────────────────────────────────────────────────
let _parsed = {};
try {
    _parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} catch (err) {
    console.error('[Store] Error reading store.json — starting with empty state', err);
}

export const reviewsStore = _parsed.reviewsStore || {};

export let bannerConfig = _parsed.bannerConfig || {
    titlePrefix:    'Wedding &',
    titleHighlight: 'Festive Collection ' + new Date().getFullYear(),
    description:    'Make every celebration unforgettable with our exclusive festive collection. Curated designs perfect for weddings, Diwali, and special occasions.',
    buttonText:     'Shop Festive Collection',
    discountNum:    'Up to 30%',
    discountLabel:  'Festive Discount',
    designsNum:     '100+',
    designsLabel:   'Approx. New Designs',
    imageUrl:       'https://images.unsplash.com/photo-1756483510767-35245638c057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    badgeTitle:     'SALE',
    badgeLabel:     'Limited Time',
    marqueeText:    'Free shipping all over Maharashtra',
};

/** Persist the current in-memory state to disk */
export function persistStore() {
    fs.writeFileSync(DB_FILE, JSON.stringify({ reviewsStore, bannerConfig }, null, 2));
}

/** Replace the in-memory bannerConfig (call persistStore() after) */
export function setBannerConfig(config) {
    bannerConfig = config;
}
