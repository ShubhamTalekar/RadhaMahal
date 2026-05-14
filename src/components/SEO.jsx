import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function SEO({ 
    title = 'Radha Mahal – By Neha', 
    description = 'Bespoke bridal wear, festive ensembles, and exquisite handcrafted elegance from Radha Mahal.',
    image = 'https://radhamahal.com/og-default.jpg',
    type = 'website'
}) {
    const location = useLocation();
    const siteUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    // For local dev, window.location.origin is localhost. For production, siteUrl should be the canonical domain.
    // Ideally, we'd use a dedicated canonical domain env var, but siteUrl works.
    const canonicalDomain = "https://radhamahal.com"; // hardcoding production domain for canonicals is safest to avoid localhost leaking in prod builds.
    const canonicalUrl = `${canonicalDomain}${location.pathname}`;

    return (
        <Helmet>
            {/* Standard HTML */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
}
