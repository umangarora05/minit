// ========================================================================
// MODULE 4: Event-Driven Order Controller
// ========================================================================
// Topics: Kafka Producer, Event-Driven Architecture, Non-blocking I/O
// ========================================================================

const Order = require('../models/Order');
const Product = require('../models/Product'); // Needed for getVendorSales
const { produceEvent, TOPICS } = require('../config/kafka');

// ========================================================================
// CREATE — Place an order (ASYNCHRONOUS EVENT-DRIVEN)
// ========================================================================
const addOrderItems = async (req, res) => {
    const { orderItems, totalPrice, paymentMethod, deliveryAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    if (!deliveryAddress || deliveryAddress.trim().length === 0) {
        return res.status(400).json({ message: 'Delivery address is required' });
    }

    try {
        // STEP 1: Save the order immediately with "pending" status
        // We DO NOT check stock synchronously here anymore!
        const order = new Order({
            orderItems,
            user: req.user._id,
            totalPrice,
            deliveryAddress: deliveryAddress.trim(),
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: 'pending', // Will be updated by Payment Consumer
            status: 'pending'         // Will be updated by Delivery Consumer
        });
        const createdOrder = await order.save();

        // STEP 2: Publish "OrderCreated" event to Kafka topic "orders"
        // This decouples the order ingestion from processing logic.
        await produceEvent(TOPICS.ORDER_CREATED, {
            orderId: createdOrder._id,
            userId: req.user._id,
            totalPrice,
            paymentMethod,
            items: orderItems,
        });

        // STEP 3: Return response to user IMMEDIATELY (High Throughput)
        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ — Get order by ID
const getOrderById = async (req, res) => {
    try {
        console.log(`[OrderController] getOrderById called with id: ${req.params.id}. URL was: ${req.originalUrl}`);
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) res.json(order);
        else res.status(404).json({ message: 'Order not found' });
    } catch (error) {
        console.error(`[OrderController] Error in getOrderById:`, error.message);
        res.status(500).json({ message: error.message });
    }
};

// READ — Get logged-in user's orders
const getMyOrders = async (req, res) => {
    // Sort by createdAt descending so newest is first
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// READ — Get ALL orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE — Change order status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (order) {
        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// VENDOR SALES STATS
const getVendorSales = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const vendorProducts = await Product.find({ vendor: vendorId });
        const productIds = vendorProducts.map(p => p._id.toString());
        const allOrders = await Order.find({}).populate('user', 'name');

        let totalRevenue = 0, totalItemsSold = 0;
        const salesByProduct = {}, salesByDate = {}, recentOrders = [];

        allOrders.forEach(order => {
            order.orderItems.forEach(item => {
                if (productIds.includes(item.product.toString())) {
                    const revenue = item.price * item.qty;
                    totalRevenue += revenue;
                    totalItemsSold += item.qty;

                    if (!salesByProduct[item.name]) salesByProduct[item.name] = { qty: 0, revenue: 0 };
                    salesByProduct[item.name].qty += item.qty;
                    salesByProduct[item.name].revenue += revenue;

                    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN');
                    if (!salesByDate[dateStr]) salesByDate[dateStr] = 0;
                    salesByDate[dateStr] += revenue;

                    recentOrders.push({
                        orderId: order._id, customerName: order.user?.name || 'Unknown',
                        productName: item.name, qty: item.qty, revenue,
                        status: order.status, date: order.createdAt
                    });
                }
            });
        });

        recentOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({
            totalRevenue, totalItemsSold, totalProducts: vendorProducts.length,
            totalOrders: recentOrders.length, salesByProduct, salesByDate,
            recentOrders: recentOrders.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addOrderItems,
     getOrderById, 
     getMyOrders, 
     getOrders, 
     updateOrderStatus, 
     getVendorSales };
