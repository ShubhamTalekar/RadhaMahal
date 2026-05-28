import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GraphQLClient } from 'graphql-request';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const domain = process.env.VITE_SHOPIFY_DOMAIN;
const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !storefrontToken) {
    console.error('Error: VITE_SHOPIFY_DOMAIN or VITE_SHOPIFY_STOREFRONT_TOKEN is not defined in .env.local');
    process.exit(1);
}

const endpoint = `https://${domain}/api/2024-01/graphql.json`;

const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        'X-Shopify-Storefront-Access-Token': storefrontToken,
        'Content-Type': 'application/json',
    },
});

const SITE_URL = process.env.VITE_SITE_URL || 'https://radhamahal.com';

const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          updatedAt
        }
      }
    }
  }
`;

async function fetchAllProducts() {
    let products = [];
    let hasNextPage = true;
    let cursor = null;

    console.log('Fetching products from Shopify...');

    while (hasNextPage) {
        const data = await graphQLClient.request(PRODUCTS_QUERY, {
            first: 250,
            after: cursor,
        });

        const fetchedProducts = data.products.edges.map((edge) => ({
            id: edge.node.id.split('/').pop(),
            updatedAt: edge.node.updatedAt,
        }));

        products = products.concat(fetchedProducts);

        hasNextPage = data.products.pageInfo.hasNextPage;
        cursor = data.products.pageInfo.endCursor;
    }

    console.log(`Fetched ${products.length} products.`);
    return products;
}

function generateXml(products) {
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/catalog', changefreq: 'daily', priority: '0.9' },
        { url: '/our-story', changefreq: 'monthly', priority: '0.8' },
        { url: '/video-consultation', changefreq: 'monthly', priority: '0.8' },
        { url: '/size-guide', changefreq: 'monthly', priority: '0.5' },
        { url: '/contact', changefreq: 'monthly', priority: '0.5' },
        { url: '/faq', changefreq: 'monthly', priority: '0.5' },
        { url: '/terms', changefreq: 'yearly', priority: '0.3' },
        { url: '/privacy', changefreq: 'yearly', priority: '0.3' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    staticRoutes.forEach(route => {
        xml += `
  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    // Add product routes
    products.forEach(product => {
        const lastmod = product.updatedAt.split('T')[0];
        xml += `
  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    return xml;
}

async function main() {
    try {
        const products = await fetchAllProducts();
        const sitemapXml = generateXml(products);

        const publicDir = path.resolve(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const sitemapPath = path.join(publicDir, 'sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemapXml);

        console.log(`Successfully generated sitemap.xml at ${sitemapPath}`);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

main();
