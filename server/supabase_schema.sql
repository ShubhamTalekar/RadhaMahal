-- Run this in your Supabase SQL Editor to create the required tables for the backend

CREATE TABLE IF NOT EXISTS store_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial empty states if they don't exist
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
