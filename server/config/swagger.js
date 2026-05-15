import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Radha Mahal Backend API',
            version: '1.0.0',
            description: `
Express.js concierge bridge between the Radha Mahal React storefront and Shopify Admin/Storefront APIs.

**Authentication:** Admin-only endpoints require a Bearer JWT obtained from \`POST /api/v1/api/admin/login\`.

**Base URL:** \`/api/v1\`
            `.trim(),
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Review: {
                    type: 'object',
                    properties: {
                        author:  { type: 'string', example: 'Priya S.' },
                        rating:  { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                        comment: { type: 'string', example: 'Beautiful saree, loved the fabric quality!' },
                        date:    { type: 'string', format: 'date-time' },
                    },
                },
                BannerConfig: {
                    type: 'object',
                    properties: {
                        titlePrefix:    { type: 'string', example: 'Wedding &' },
                        titleHighlight: { type: 'string', example: 'Festive Collection 2025' },
                        description:    { type: 'string' },
                        buttonText:     { type: 'string', example: 'Shop Festive Collection' },
                        discountNum:    { type: 'string', example: 'Up to 30%' },
                        discountLabel:  { type: 'string', example: 'Festive Discount' },
                        designsNum:     { type: 'string', example: '100+' },
                        designsLabel:   { type: 'string', example: 'Approx. New Designs' },
                        imageUrl:       { type: 'string', format: 'uri' },
                        badgeTitle:     { type: 'string', example: 'SALE' },
                        badgeLabel:     { type: 'string', example: 'Limited Time' },
                        marqueeText:    { type: 'string', example: 'Free shipping all over Maharashtra' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Something went wrong' },
                    },
                },
            },
        },
        servers: [
            { url: '/api/v1', description: 'Current server' },
        ],
    },
    // Scan all route files for JSDoc @openapi annotations
    apis: ['./routes/*.js', './controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
