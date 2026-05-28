import { fetchOrderByNumber } from '../services/shopify.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHOPIFY_ADMIN_TOKEN } from '../config/env.js';

export const trackOrder = asyncHandler(async (req, res) => {
    if (!SHOPIFY_ADMIN_TOKEN) return res.status(500).json({ error: 'Shopify Admin Token not configured' });
    const orderNumber = req.params.orderNumber.replace(/^#/, '').trim();
    const data  = await fetchOrderByNumber(orderNumber);
    const order = data.orders?.[0];
    if (!order) return res.status(404).json({ error: 'Order not found matching that code' });

    const hasFulfillment = order.fulfillments && order.fulfillments.length > 0;
    const fulfillment = hasFulfillment ? order.fulfillments[0] : null;
    const isCancelled = order.cancelled_at !== null;

    let currentStageIndex = 0;
    let stage0Status = 'completed'; // Handcrafted & Packaged
    let stage1Status = 'pending';   // Dispatched
    let stage2Status = 'pending';   // In Transit
    let stage3Status = 'pending';   // Out for Delivery
    let stage4Status = 'pending';   // Delivered

    let dispatchDate = null;
    let transitDate = null;
    let outForDeliveryDate = null;
    let deliveryDate = null;

    if (isCancelled) {
        stage0Status = 'cancelled';
        stage1Status = 'cancelled';
        stage2Status = 'cancelled';
        stage3Status = 'cancelled';
        stage4Status = 'cancelled';
    } else if (hasFulfillment) {
        dispatchDate = new Date(fulfillment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        stage1Status = 'completed';
        currentStageIndex = 1;

        const shipStatus = fulfillment.shipment_status ? fulfillment.shipment_status.toLowerCase() : null;

        if (shipStatus === 'delivered') {
            stage1Status = 'completed';
            stage2Status = 'completed';
            stage3Status = 'completed';
            stage4Status = 'completed';
            currentStageIndex = 4;

            transitDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            outForDeliveryDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            deliveryDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } else if (shipStatus === 'out_for_delivery' || shipStatus === 'attempted_delivery' || shipStatus === 'ready_for_pickup') {
            stage1Status = 'completed';
            stage2Status = 'completed';
            stage3Status = 'active';
            currentStageIndex = 3;

            transitDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            outForDeliveryDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } else if (shipStatus === 'in_transit' || shipStatus === 'confirmed' || shipStatus === 'picked_up') {
            stage1Status = 'completed';
            stage2Status = 'active';
            currentStageIndex = 2;

            transitDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            // fulfillment is created but shipment_status is not updated yet or is null/empty.
            // Mark Dispatched as completed, and Transit as active (in transit by default).
            stage1Status = 'completed';
            stage2Status = 'active';
            currentStageIndex = 2;
            transitDate = new Date(fulfillment.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    } else {
        // No fulfillment yet, order is processing.
        stage1Status = 'active';
        currentStageIndex = 0;
    }

    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const stages = [
        {
            key: 'handcrafted',
            title: 'Handcrafted & Packaged',
            description: order.fulfillment_status 
                ? 'Your creation has been handwoven, carefully detailed, and packaged in our custom atelier box.'
                : 'We are preparing your masterpiece at our atelier.',
            date: orderDate,
            status: stage0Status,
        },
        {
            key: 'dispatched',
            title: 'Dispatched',
            description: hasFulfillment
                ? `Handed over to ${fulfillment.tracking_company || 'carrier'}.`
                : 'Awaiting package handoff to courier.',
            date: dispatchDate,
            status: stage1Status,
        },
        {
            key: 'in_transit',
            title: 'In Transit',
            description: stage2Status === 'completed'
                ? 'Package transit completed. Arrived at your local delivery hub.'
                : stage2Status === 'active'
                ? 'Your heritage weave is on its way, moving through the carrier\'s network.'
                : 'Transit will begin once the package is dispatched.',
            date: transitDate,
            status: stage2Status,
        },
        {
            key: 'out_for_delivery',
            title: 'Out for Delivery',
            description: stage3Status === 'completed'
                ? 'Out for delivery completed.'
                : stage3Status === 'active'
                ? 'Our delivery partner is bringing your Radha Mahal creation to your doorstep today!'
                : 'Awaiting arrival at the local distribution center.',
            date: outForDeliveryDate,
            status: stage3Status,
        },
        {
            key: 'delivered',
            title: 'Delivered',
            description: stage4Status === 'completed'
                ? 'Successfully received. We hope this heirloom brings you joy for generations to come.'
                : 'Awaiting delivery.',
            date: deliveryDate,
            status: stage4Status,
        }
    ];

    res.status(200).json({
        id:       order.order_number,
        name:     order.name,
        status:   order.fulfillment_status || 'Processing',
        date:     orderDate,
        tracking: fulfillment ? { number: fulfillment.tracking_number, company: fulfillment.tracking_company, url: fulfillment.tracking_url } : null,
        currentStage: currentStageIndex,
        stages: stages
    });
});
