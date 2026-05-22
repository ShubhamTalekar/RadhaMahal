import contactRoutes from './contact.js';
import consultationRoutes from './consultation.js';
import authRoutes from './auth.js';
import wishlistRoutes from './wishlist.js';
import bagRoutes from './bag.js';
import webhooksRoutes from './webhooks.js';
import ordersRoutes from './orders.js';
import notificationsRoutes from './notifications.js';
import reviewsRoutes from './reviews.js';
import adminRoutes from './admin.js';
// openapi.js is a JSDoc-only file scanned by swagger-jsdoc via config/swagger.js

export function registerRoutes(app) {
    app.use('/', contactRoutes);
    app.use('/', consultationRoutes);
    app.use('/', authRoutes);
    app.use('/', wishlistRoutes);
    app.use('/', bagRoutes);
    app.use('/', webhooksRoutes);
    app.use('/', ordersRoutes);
    app.use('/', notificationsRoutes);
    app.use('/', reviewsRoutes);
    app.use('/', adminRoutes);
}
