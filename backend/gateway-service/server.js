const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

app.use(createProxyMiddleware({
    target: 'http://localhost', // Fallback
    router: function(req) {
        if (req.path.startsWith('/api/auth')) return 'http://minit-auth-service:5001';
        if (req.path.startsWith('/api/orders')) return 'http://minit-order-service:5002';
        if (req.path.startsWith('/api/products')) return 'http://minit-inventory-service:5003';
        if (req.path.startsWith('/api/delivery')) return 'http://minit-delivery-service:5004';
        if (req.path.startsWith('/api/payments')) return 'http://minit-payment-service:5005';
        if (req.path.startsWith('/api/admin')) return 'http://minit-admin-service:5006';
        return null;
    },
    changeOrigin: true
}));

app.get('/', (req, res) => res.send('MINIT API Gateway is running...'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Gateway Service running on port ${PORT}`));
