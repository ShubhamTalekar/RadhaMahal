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
    app.use('/api', contactRoutes);
    app.use('/api', consultationRoutes);
    app.use('/api', authRoutes);
    app.use('/api', wishlistRoutes);
    app.use('/api', bagRoutes);
    app.use('/api', webhooksRoutes);
    app.use('/api', ordersRoutes);
    app.use('/api', notificationsRoutes);
    app.use('/api', reviewsRoutes);
    app.use('/api', adminRoutes);
}
