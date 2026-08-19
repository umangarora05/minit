const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

// 1. Move the root route ABOVE the proxy so it doesn't get intercepted
app.get('/', (req, res) => res.send('MINIT API Gateway is running...'));

// 2. Add the '/api' filter here so the proxy ONLY catches API routes
app.use('/api', createProxyMiddleware({
    target: 'http://localhost', // Fallback for local Docker
    router: function(req) {
        // Reads from Render Env Vars, falls back to local Docker Compose names
        if (req.path.startsWith('/api/auth')) return process.env.AUTH_SERVICE_URL || 'http://minit-auth-service:5001';
        if (req.path.startsWith('/api/orders')) return process.env.ORDER_SERVICE_URL || 'http://minit-order-service:5002';
        if (req.path.startsWith('/api/products')) return process.env.INVENTORY_SERVICE_URL || 'http://minit-inventory-service:5003';
        if (req.path.startsWith('/api/delivery')) return process.env.DELIVERY_SERVICE_URL || 'http://minit-delivery-service:5004';
        if (req.path.startsWith('/api/payments')) return process.env.PAYMENT_SERVICE_URL || 'http://minit-payment-service:5005';
        if (req.path.startsWith('/api/admin')) return process.env.ADMIN_SERVICE_URL || 'http://minit-admin-service:5006';
        return null;
    },
    changeOrigin: true
}));

// 3. Allow Render to inject its own dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gateway Service running on port ${PORT}`));