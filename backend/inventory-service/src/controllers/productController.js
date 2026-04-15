// ========================================================================
// MODULE 4: MongoDB CRUD Operations — Product Controller + Redis Cache
// ========================================================================
// Topics: CRUD, Redis Caching, Async/Await, Request/Response
// ========================================================================

const Product = require('../models/Product');
const { getCache, setCache, delCache } = require('../config/redis');

// ========================================================================
// READ — Fetch all products (with Redis cache)
// ========================================================================
const getProducts = async (req, res) => {
    try {
        // Try Redis cache first
        const cached = await getCache('products:all');
        if (cached) {
            return res.json(JSON.parse(cached)); // Cache hit — return cached data
        }
        // Cache miss — fetch from MongoDB
        const products = await Product.find({});
        // Store in Redis cache for 30 seconds
        await setCache('products:all', JSON.stringify(products), 30);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ — Fetch single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE — Add a new product
const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, category, stock } = req.body;
        const product = new Product({
            name, price, description, image, category, stock,
            vendor: req.user._id
        });
        const createdProduct = await product.save();
        // Invalidate the products cache so next fetch gets fresh data
        await delCache('products:all');
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE — Modify an existing product
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, category, stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.image = image || product.image;
            product.category = category || product.category;
            product.stock = stock !== undefined ? stock : product.stock;

            const updatedProduct = await product.save();
            // Invalidate caches
            await delCache('products:all');
            await delCache(`stock:${product._id}`);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE — Remove a product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await product.deleteOne();
            // Invalidate caches
            await delCache('products:all');
            await delCache(`stock:${product._id}`);
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/products/:id/stock — Get real-time stock (Redis-first)
const getProductStock = async (req, res) => {
    try {
        let stock = await getCache(`stock:${req.params.id}`);
        if (stock !== null) {
            return res.json({ stock: parseInt(stock) });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await setCache(`stock:${product._id}`, product.stock, 60);
        res.json({ stock: product.stock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductStock };
