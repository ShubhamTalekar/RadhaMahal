import { shopifyApiBase, shopifyHeaders, shopifyReadHeaders } from '../config/shopify.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

/** Find an existing Shopify customer by email, returns customer object or null */
export async function findCustomerByEmail(email) {
    const url = `${shopifyApiBase()}/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`;
    const res  = await fetch(url, { headers: shopifyReadHeaders() });
    const data = await res.json();
    return data.customers?.[0] || null;
}

/** Create a new Shopify customer */
export async function createCustomer(customerData) {
    const res  = await fetch(`${shopifyApiBase()}/customers.json`, {
        method:  'POST',
        headers: shopifyHeaders(),
        body:    JSON.stringify({ customer: customerData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Shopify customer creation failed: ${JSON.stringify(data)}`);
    return data.customer;
}

/** Update an existing Shopify customer by ID */
export async function updateCustomer(customerId, fields) {
    await fetch(`${shopifyApiBase()}/customers/${customerId}.json`, {
        method:  'PUT',
        headers: shopifyHeaders(),
        body:    JSON.stringify({ customer: { id: customerId, ...fields } }),
    });
}

/**
 * Find or auto-create a customer.
 * @param {string} email
 * @param {string|null} fallbackName - used to derive first/last name if creating
 */
export async function findOrCreateCustomer(email, fallbackName = null) {
    const existing = await findCustomerByEmail(email);
    if (existing) return existing;

    const parts     = (fallbackName || email.split('@')[0] || 'Patron').split(/[\s._]/);
    const firstName = parts[0] || 'Radha';
    const lastName  = parts.slice(1).join(' ') || 'Mahal Patron';

    return createCustomer({
        first_name:     firstName,
        last_name:      lastName,
        email,
        verified_email: true,
        send_email_welcome: false,
    });
}

/**
 * Upsert a customer metafield (JSON type).
 * Creates it if absent, updates if present.
 */
export async function upsertMetafield(customerId, namespace, key, value) {
    const base        = `${shopifyApiBase()}/customers/${customerId}/metafields`;
    const existingRes = await fetch(`${base}.json?namespace=${namespace}&key=${key}`, {
        headers: shopifyReadHeaders(),
    });
    const existingData = await existingRes.json();
    const existing     = existingData.metafields?.[0];

    if (existing) {
        await fetch(`${base}/${existing.id}.json`, {
            method:  'PUT',
            headers: shopifyHeaders(),
            body:    JSON.stringify({ metafield: { id: existing.id, value: JSON.stringify(value), type: 'json' } }),
        });
    } else {
        await fetch(`${base}.json`, {
            method:  'POST',
            headers: shopifyHeaders(),
            body:    JSON.stringify({ metafield: { namespace, key, value: JSON.stringify(value), type: 'json' } }),
        });
    }
}

/** Fetch all orders for a customer email */
export async function fetchOrdersByEmail(email) {
    const url = `${shopifyApiBase()}/orders.json?email=${email}&status=any`;
    const res = await fetch(url, { headers: shopifyReadHeaders() });
    return res.json();
}

/** Fetch a single order by order name/number */
export async function fetchOrderByNumber(orderNumber) {
    const url = `${shopifyApiBase()}/orders.json?name=${orderNumber}&status=any`;
    const res = await fetch(url, { headers: shopifyReadHeaders() });
    return res.json();
}

/** Fetch variant by inventory_item_id to resolve productId and title */
export async function fetchVariantByInventoryItem(inventoryItemId) {
    const url = `${shopifyApiBase()}/variants.json?inventory_item_ids=${inventoryItemId}&limit=1`;
    const res = await fetch(url, { headers: shopifyReadHeaders() });
    return res.json();
}

/** Fetch a product by ID (fields: id,title) */
export async function fetchProductTitle(productId) {
    const url = `${shopifyApiBase()}/products/${productId}.json?fields=id,title`;
    const res = await fetch(url, { headers: shopifyReadHeaders() });
    const data = await res.json();
    return data.product?.title || '';
}

/** Paginate all customers (yields pages of customers) */
export async function* paginateCustomers(fields = 'id,email') {
    let page = `${shopifyApiBase()}/customers.json?limit=250&fields=${fields}`;
    while (page) {
        const res  = await fetch(page, { headers: shopifyReadHeaders() });
        const data = await res.json();
        yield data.customers || [];
        const link      = res.headers.get('Link') || '';
        const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
        page = nextMatch ? nextMatch[1] : null;
    }
}

/** Fetch radha_mahal metafields for a customer */
export async function fetchCustomerMetafields(customerId) {
    const url = `${shopifyApiBase()}/customers/${customerId}/metafields.json?namespace=radha_mahal`;
    const res = await fetch(url, { headers: shopifyReadHeaders() });
    const data = await res.json();
    return data.metafields || [];
}

/**
 * GraphQL-based: paginate all customers with their radha_mahal metafields
 * in a single request per page (eliminates N+1 REST calls).
 * Yields arrays of { email, metafields: [{key, value}] } for customers that
 * have at least one radha_mahal metafield.
 */
export async function* paginateCustomersWithMetafields() {
    const { shopifyApiBase: _unused, ..._ } = {}; // just for scoping
    const shopifyDomain = process.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
    const apiVersion    = process.env.VITE_SHOPIFY_API_VERSION || '2025-01';
    const graphqlUrl    = `https://${shopifyDomain}/admin/api/${apiVersion}/graphql.json`;

    const query = `
      query GetCustomersWithMetafields($cursor: String) {
        customers(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              email
              metafields(namespace: "radha_mahal", first: 10) {
                edges {
                  node { key value }
                }
              }
            }
          }
        }
      }
    `;

    let cursor = null;
    do {
        const res = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
            },
            body: JSON.stringify({ query, variables: { cursor } }),
        });

        const { data, errors } = await res.json();
        if (errors) {
            console.error('[Shopify GQL] paginateCustomersWithMetafields error:', errors);
            break;
        }

        const customersPage = data?.customers?.edges || [];
        const pageInfo      = data?.customers?.pageInfo;

        yield customersPage
            .map(({ node }) => ({
                email:      node.email,
                metafields: node.metafields.edges.map(e => e.node),
            }))
            .filter(c => c.email && c.metafields.length > 0);

        cursor = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
    } while (cursor);
}
