const Order = require('../models/Order');
const { produceEvent, TOPICS } = require('../config/kafka');

// POST /api/delivery/:orderId/accept
const acceptDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Verify order exists before emitting event (optional but good practice)
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Emit an event to update the status in a decoupled way
        const eventId = await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
            orderId,
            status: 'preparing', // Driver accepted, now grabbing package
            deliveryDriverId: req.user._id // Tracking who accepted it
        });

        res.status(200).json({ 
            message: 'Delivery accepted, status update queued', 
            eventId 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/delivery/:orderId/deliver
const markDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Verify order exists before emitting event
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Emit an event to update the status in a decoupled way
        const eventId = await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
            orderId,
            status: 'delivered',
            deliveryDriverId: req.user._id
        });

        res.status(200).json({ 
            message: 'Order marked delivered, status update queued',
            eventId 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/delivery/:orderId/start
const startDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const eventId = await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
            orderId,
            status: 'out_for_delivery',
            deliveryDriverId: req.user._id
        });

        res.status(200).json({ 
            message: 'Delivery started, status update queued',
            eventId 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    acceptDelivery,
    startDelivery,
    markDelivered
};
