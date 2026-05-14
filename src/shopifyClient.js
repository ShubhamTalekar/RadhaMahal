import { GraphQLClient, gql } from 'graphql-request';

const domain = import.meta.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

// Connect directly to the Shopify Storefront API from the browser.
// The public token is safe to expose in frontend code.
const SHOPIFY_API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2025-01';
const endpoint = `https://${domain}/api/v1/${SHOPIFY_API_VERSION}/graphql.json`;

const client = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': storefrontToken,
    'Content-Type': 'application/json',
  }
});

const PRODUCTS_QUERY = gql`
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          availableForSale
          descriptionHtml
          productType
          tags
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                }
                compareAtPrice {
                  amount
                }
              }
            }
          }
          images(first: 3) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

let productsPromise = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function shapeProduct(node) {
  const variant = node.variants.edges[0]?.node;
  const price = parseFloat(variant?.price?.amount ?? 0);
  const compareAtPrice = parseFloat(variant?.compareAtPrice?.amount ?? price);
  const numericId = node.id.split('/').pop();
  const tags = node.tags ?? [];
  const colorTags = tags.filter(t => t.toLowerCase().startsWith('color:')).map(t => t.replace(/^color:/i, '').trim());
  const occasionTags = tags.filter(t => t.toLowerCase().startsWith('occasion:')).map(t => t.replace(/^occasion:/i, '').trim());

  return {
    id: numericId,
    title: node.title,
    name: node.title,
    availableForSale: node.availableForSale,
    description: node.descriptionHtml?.replace(/<[^>]*>?/gm, '') ?? '',
    category: node.productType || 'Other',
    price: compareAtPrice,
    final_price: price,
    discount_percent: compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0,
    colors: colorTags.length ? colorTags : tags,
    occasion: occasionTags.length ? occasionTags : tags,
    images: node.images.edges.map(e => e.node.url),
    defaultVariantId: node.variants.edges[0]?.node.id ?? null,
    variants: node.variants.edges
      .map(v => ({ id: v.node.id, title: v.node.title, available: v.node.availableForSale }))
      .filter(v => v.title && v.title.toLowerCase() !== 'default title'),
  };
}

export function getProducts(forceRefresh = false) {
  const now = Date.now();
  if (productsPromise && !forceRefresh && (now - lastFetchTime < CACHE_TTL)) {
    return productsPromise;
  }
  
  productsPromise = (async () => {
    try {
      const data = await client.request(PRODUCTS_QUERY, { first: 50 });

      if (data && data.products && data.products.edges.length > 0) {
        lastFetchTime = Date.now();
        return data.products.edges.map(edge => {
          return shapeProduct(edge.node);
        });
      }
    } catch (error) {
      productsPromise = null;
      console.error("Shopify Storefront API fetch failed:", error);
    }
    return [];
  })();
  
  return productsPromise;
}

const PRODUCT_BY_ID_QUERY = gql`
  query getProductById($id: ID!) {
    product(id: $id) {
      id
      title
      availableForSale
      descriptionHtml
      productType
      tags
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount }
            compareAtPrice { amount }
          }
        }
      }
      images(first: 5) {
        edges {
          node { url altText }
        }
      }
      media(first: 6) {
        edges {
          node {
            mediaContentType
            ... on Video {
              sources { url format }
            }
          }
        }
      }
    }
  }
`;

export async function getProductById(id) {
  try {
    const gid = id.includes('gid://') ? id : `gid://shopify/Product/${id}`;
    const data = await client.request(PRODUCT_BY_ID_QUERY, { id: gid });
    if (data && data.product) {
      const shaped = shapeProduct(data.product);

      const videos = data.product.media?.edges
        .filter(e => e.node.mediaContentType === 'VIDEO')
        .map(e => e.node.sources?.find(s => s.format === 'mp4')?.url || e.node.sources?.[0]?.url)
        .filter(Boolean) || [];

      return {
        ...shaped,
        videos
      };
    }
  } catch (error) {
    console.error("Shopify getProductById failed:", error);
  }
  return null;
}

// ─── Carousel / Hero Slides ───────────────────────────────────────────────────

const CAROUSEL_QUERY = gql`
  query getCarouselProducts {
    products(first: 10, query: "tag:carousel") {
      edges {
        node {
          id
          title
          handle
          tags
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          media(first: 5) {
            edges {
              node {
                mediaContentType
                ... on Video {
                  sources {
                    url
                    format
                  }
                }
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches products tagged "carousel" from Shopify and shapes them
 * into hero slide objects ready for use in the homepage carousel.
 *
 * Each returned object has:
 *   { id, title, image, altText, handle }
 *
 * Returns an empty array if no tagged products are found.
 */
export async function getCarouselProducts() {
  try {
    const data = await client.request(CAROUSEL_QUERY);
    const edges = data?.products?.edges ?? [];
    if (edges.length === 0) return [];

    return edges.map(({ node }) => {
      const numericId = node.id.split('/').pop();
      const imgNode = node.images.edges[0]?.node;

      // Extract the first MP4 video URL from the product's media (if any)
      const videoSource = node.media?.edges
        .find(e => e.node.mediaContentType === 'VIDEO')
        ?.node.sources?.find(s => s.format === 'mp4') ??
        node.media?.edges
          .find(e => e.node.mediaContentType === 'VIDEO')
          ?.node.sources?.[0];

      return {
        id: numericId,
        title: node.title,
        handle: node.handle,
        image: imgNode?.url ?? '',
        altText: imgNode?.altText ?? node.title,
        videoUrl: videoSource?.url ?? null,
      };
    });
  } catch (error) {
    console.error('Carousel products fetch failed:', error);
    return [];
  }
}

// ── customer registration ─────────────────────────────────────────────────────

const CUSTOMER_CREATE_MUTATION = gql`
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Creates a new customer in Shopify.
 * @param {Object} input - { email, password, firstName, lastName, phone }
 */
export async function registerCustomer(input) {
  try {
    const data = await client.request(CUSTOMER_CREATE_MUTATION, { input });
    return data.customerCreate;
  } catch (error) {
    console.error('Shopify customerCreate failed:', error);
    return {
      customer: null,
      customerUserErrors: [{ message: 'Service unavailable. Please try again later.' }]
    };
  }
}

// ── Shopify Cart and Checkout ──────────────────────────────────────────────────

const CART_CREATE_MUTATION = gql`
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Creates a Shopify Cart and returns the checkout URL.
 * @param {Array} lines - Array of { variantId, quantity }
 */
export async function createShopifyCart(lines, shippingDetails, email) {
  try {
    const validLines = lines.filter(item => item.variantId);
    if (validLines.length === 0) {
      throw new Error('No valid product variants found. Please re-add items to your bag and try again.');
    }
    
    const nameParts = (shippingDetails?.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const input = {
      lines: validLines.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity
      })),
      ...((email || (firstName && lastName)) && {
        buyerIdentity: {
          ...(email && { email }),
          ...(firstName && lastName && {
            deliveryAddressPreferences: [{
              deliveryAddress: {
                firstName: firstName,
                lastName: lastName,
                address1: shippingDetails?.street || '',
                city: shippingDetails?.city || '',
                zip: shippingDetails?.pin || '',
                country: 'IN'
              }
            }]
          })
        }
      })
    };
    const data = await client.request(CART_CREATE_MUTATION, { input });
    return data.cartCreate;
  } catch (error) {
    console.error('Shopify cartCreate failed:', error);
    return null;
  }
}

// ── Customer Authentication (Login) ──────────────────────────────────────────

const LOGIN_MUTATION = gql`
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
      }
      customerUserErrors {
        message
      }
    }
  }
`;

const CUSTOMER_QUERY = gql`
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      orders(first: 10) {
        edges {
          node {
            orderNumber
            processedAt
            financialStatus
            totalPrice { amount }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  variant {
                    image { url }
                    product { id }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Authenticates a customer against Shopify using their email and password.
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { customer: Object|null, error: string|null }
 */
export async function loginCustomer(email, password) {
  try {
    const tokenData = await client.request(LOGIN_MUTATION, { input: { email, password } });
    const { customerAccessToken, customerUserErrors } = tokenData.customerAccessTokenCreate;
    
    if (customerUserErrors && customerUserErrors.length > 0) {
      return { customer: null, error: customerUserErrors[0].message };
    }
    
    if (!customerAccessToken?.accessToken) {
      return { customer: null, error: 'Authentication failed.' };
    }

    const customerData = await client.request(CUSTOMER_QUERY, { customerAccessToken: customerAccessToken.accessToken });
    
    if (!customerData.customer) {
      return { customer: null, error: 'Could not retrieve profile information.' };
    }

    const customer = customerData.customer;
    
    const parsedOrders = (customer.orders?.edges || []).map(edge => {
      const o = edge.node;
      return {
        id: o.orderNumber.toString(),
        status: o.financialStatus ? o.financialStatus.toLowerCase() : 'processing',
        date: new Date(o.processedAt).toLocaleDateString('en-GB'),
        total: parseFloat(o.totalPrice.amount),
        items: (o.lineItems?.edges || []).map(li => ({
          title: li.node.title,
          quantity: li.node.quantity,
          image: li.node.variant?.image?.url
        }))
      };
    });

    return { 
      customer: {
        id: customer.id,
        email: customer.email,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        phone: customer.phone,
        shopifyToken: customerAccessToken.accessToken,
        orders: parsedOrders,
        addresses: customer.addresses?.edges?.map(a => ({
          id: a.node.id,
          title: a.node.company || 'Address',
          lines: [a.node.address1, a.node.address2, `${a.node.city}, ${a.node.province} ${a.node.zip}`, a.node.country].filter(Boolean),
          isPrimary: false
        })) || []
      } 
    };
  } catch (error) {
    console.error("Login mutation failed:", error);
    return { customer: null, error: 'Network error. Please try again.' };
  }
}

export async function getCustomer(accessToken) {
  try {
    const customerData = await client.request(CUSTOMER_QUERY, { customerAccessToken: accessToken });
    if (!customerData.customer) return null;
    
    const customer = customerData.customer;
    const parsedOrders = (customer.orders?.edges || []).map(edge => {
      const o = edge.node;
      return {
        id: o.orderNumber.toString(),
        status: o.financialStatus ? o.financialStatus.toLowerCase() : 'processing',
        date: new Date(o.processedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
        total: parseFloat(o.totalPrice?.amount || 0),
        items: (o.lineItems?.edges || []).map(li => ({
          title: li.node.title,
          quantity: li.node.quantity,
          image: li.node.variant?.image?.url
        }))
      };
    });

    return {
      id: customer.id,
      email: customer.email,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      phone: customer.phone,
      shopifyToken: accessToken,
      orders: parsedOrders,
      addresses: customer.addresses?.edges?.map(a => ({
        id: a.node.id,
        title: a.node.company || 'Address',
        lines: [a.node.address1, a.node.address2, `${a.node.city}, ${a.node.province} ${a.node.zip}`, a.node.country].filter(Boolean),
        isPrimary: false
      })) || []
    };
  } catch (error) {
    console.error("Get customer failed:", error);
    return null;
  }
}
