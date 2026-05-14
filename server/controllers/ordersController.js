import { fetchOrderByNumber } from '../services/shopify.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const trackOrder = asyncHandler(async (req, res) => {
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ error: 'Shopify Admin Token not configured' });
    const orderNumber = req.params.orderNumber.replace(/^#/, '').trim();
    const data  = await fetchOrderByNumber(orderNumber);
    const order = data.orders?.[0];
    if (!order) return res.status(404).json({ error: 'Order not found matching that code' });
    res.status(200).json({
        id:       order.order_number,
        name:     order.name,
        status:   order.fulfillment_status || 'Processing',
        date:     new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        tracking: order.fulfillments?.[0] ? { number: order.fulfillments[0].tracking_number, company: order.fulfillments[0].tracking_company, url: order.fulfillments[0].tracking_url } : null,
    });
});
