/**
 * @openapi
 * /api/contact:
 *   post:
 *     summary: Submit a contact / enquiry message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:    { type: string, example: "Priya Sharma" }
 *               email:   { type: string, format: email, example: "priya@example.com" }
 *               message: { type: string, example: "I'd love to know more about your sarees." }
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @openapi
 * /api/consultation:
 *   post:
 *     summary: Book a video styling consultation
 *     tags: [Consultation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, date]
 *             properties:
 *               name:  { type: string, example: "Priya Sharma" }
 *               email: { type: string, format: email }
 *               date:  { type: string, format: date, example: "2025-12-20" }
 *               notes: { type: string, example: "Looking for bridal sarees." }
 *     responses:
 *       200:
 *         description: Consultation request submitted
 *       400:
 *         description: Missing required fields
 */

/**
 * @openapi
 * /api/wishlist/sync:
 *   post:
 *     summary: Persist a customer's wishlist to Shopify customer metafields
 *     description: |
 *       The wishlist lives in React state / localStorage on the client.
 *       This endpoint syncs it to Shopify so it persists across devices.
 *       Uses the `radha_mahal` metafield namespace, key `wishlist`.
 *     tags: [Wishlist & Bag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, items]
 *             properties:
 *               email: { type: string, format: email }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:    { type: string }
 *                     title: { type: string }
 *     responses:
 *       200:
 *         description: Wishlist saved successfully
 */

/**
 * @openapi
 * /api/bag/sync:
 *   post:
 *     summary: Persist a customer's bag (cart) to Shopify customer metafields
 *     description: |
 *       Mirrors the wishlist sync pattern but stores the shopping bag
 *       under key `bag` in the `radha_mahal` metafield namespace.
 *     tags: [Wishlist & Bag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, items]
 *             properties:
 *               email: { type: string, format: email }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:       { type: string }
 *                     title:    { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Bag saved successfully
 */

/**
 * @openapi
 * /api/track/{orderNumber}:
 *   get:
 *     summary: Track a Shopify order by order number
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: "1001"
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */

/**
 * @openapi
 * /api/restock-notification:
 *   post:
 *     summary: Subscribe to a restock notification for an out-of-stock product
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, productTitle]
 *             properties:
 *               email:        { type: string, format: email }
 *               productTitle: { type: string, example: "Kanjivaram Silk Saree" }
 *     responses:
 *       200:
 *         description: Subscribed to restock notification
 */

/**
 * @openapi
 * /api/reviews/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: "gid://shopify/Product/123456"
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *   post:
 *     summary: Submit a new review for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [author, rating, comment]
 *             properties:
 *               author:  { type: string, example: "Neha K." }
 *               rating:  { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Review submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @openapi
 * /api/admin/login:
 *   post:
 *     summary: Authenticate as admin and receive a JWT
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "admin@radhamahal.com" }
 *               password: { type: string, example: "your_admin_password" }
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token:   { type: string }
 *       401:
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /api/public/banner:
 *   get:
 *     summary: Get the current festive banner configuration (public)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Banner config object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/BannerConfig' }
 */

/**
 * @openapi
 * /api/admin/banner:
 *   post:
 *     summary: Update the festive banner configuration (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titlePrefix:    { type: string }
 *               titleHighlight: { type: string }
 *               description:    { type: string }
 *               buttonText:     { type: string }
 *               image:          { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Banner updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     summary: Get aggregated store dashboard data (admin only)
 *     description: Returns all customers, orders, revenue, best-sellers, and top-wishlisted products from Shopify.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/webhooks/inventory-update:
 *   post:
 *     summary: Shopify inventory level update webhook
 *     description: |
 *       Called by Shopify when inventory drops to 0. Verifies the HMAC signature,
 *       resolves the product, then uses a single GraphQL query to find all customers
 *       who have that product in their wishlist or bag and sends them an email.
 *     tags: [Webhooks]
 *     parameters:
 *       - in: header
 *         name: X-Shopify-HMAC-SHA256
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Processed
 *       401:
 *         description: Invalid HMAC signature
 */
