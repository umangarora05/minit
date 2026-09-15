const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

const https = require('https');

// 1. Move the root route ABOVE the proxy so it doesn't get intercepted
app.get('/', (req, res) => {
    const aivenToken = 'Oa+seZsCgXsNaffo6r9mh+Q2YeXUetDm5Z7nUmJnIK/donN9CFrlPTw7IyMuphXycDlUVGpIjp51dTWM0/PxVnpTt1boIH0vvZ4VCEoIyVVCPV1wdj7xI2fkohn6CQnOj8MrFAE17zBSz5aSrl8frAVfyg3d7I9Er7FojZ82Ro1oDJOTn//QtcrykOt2JKXTrznrmpFzi2UMowBBvgE97pgJapnw83jjq/8qaAxIBbjVCRTZbot4vAidXv4uz1uxziCsPrhE+OG+GevzDyAOKpPCm5LnWDMMePfakYo6Uhx5FE2rZs7uXrJGltr8AhN1+zecfw3d4onLXxBrsQ0XiQIcM/kyz2gS/TgsT91SkfB3dNXB6wbbr2E=';
    const body = JSON.stringify({ powered: true });
    const reqOptions = {
        hostname: 'api.aiven.io',
        port: 443,
        path: '/v1/project/codxp/service/minit',
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${aivenToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };
    const aivenReq = https.request(reqOptions, () => {});
    aivenReq.on('error', (e) => console.error('Aiven wakeup error:', e.message));
    aivenReq.write(body);
    aivenReq.end();

    res.send('MINIT API Gateway is running...');
});

// 2. Add the '/api' filter here so the proxy ONLY catches API routes
app.use(createProxyMiddleware({
    pathFilter: '/api',
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