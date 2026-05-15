import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Store] Supabase configured for persistent storage.');
} else {
    console.warn('[Store] ⚠️ Supabase not configured. Falling back to ephemeral memory (data will be lost on restart in cluster mode).');
}

// Fallback in-memory state
let _memReviewsStore = {};
let _memBannerConfig = {
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

export async function getReviewsStore() {
    if (!supabase) return _memReviewsStore;
    const { data, error } = await supabase.from('store_data').select('data').eq('id', 'reviewsStore').single();
    if (error) {
        if (error.code === 'PGRST116') return {}; // Not found
        console.error('[Store] Error fetching reviews from Supabase:', error);
        return _memReviewsStore;
    }
    return data?.data || {};
}

export async function setReviewsStore(store) {
    if (!supabase) {
        _memReviewsStore = store;
        return;
    }
    const { error } = await supabase.from('store_data').upsert({ id: 'reviewsStore', data: store });
    if (error) console.error('[Store] Error saving reviews to Supabase:', error);
}

export async function getBannerConfig() {
    if (!supabase) return _memBannerConfig;
    const { data, error } = await supabase.from('store_data').select('data').eq('id', 'bannerConfig').single();
    if (error) {
        if (error.code === 'PGRST116') return _memBannerConfig; // Not found
        console.error('[Store] Error fetching banner config from Supabase:', error);
        return _memBannerConfig;
    }
    return data?.data || _memBannerConfig;
}

export async function setBannerConfig(config) {
    if (!supabase) {
        _memBannerConfig = config;
        return;
    }
    const { error } = await supabase.from('store_data').upsert({ id: 'bannerConfig', data: config });
    if (error) console.error('[Store] Error saving banner config to Supabase:', error);
}

