const { Supplier, Product, Order } = require('../models');

// Register Supplier
const register = async (req, res) => {
    try {
        const { name, email, password, walletAddress, companyName } = req.body;
        const existing = await Supplier.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const supplier = await Supplier.create({ name, email, password, walletAddress, companyName });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Error registering supplier', error: error.message });
    }
};

// Login Supplier (Simple plain text password for prototype)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const supplier = await Supplier.findOne({ where: { email, password } });
        if (!supplier) return res.status(401).json({ message: 'Invalid credentials' });
        
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Create Product
const createProduct = async (req, res) => {
    try {
        const { supplierId, name, description, price, stock, category } = req.body;
        let imageUrl = req.body.imageUrl || '';

        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        const product = await Product.create({
            supplierId, name, description, price, stock, imageUrl, category
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

// Get Supplier's Products
const getMyProducts = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const products = await Product.findAll({ where: { supplierId } });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your products', error: error.message });
    }
};

// Get Incoming Orders
const getIncomingOrders = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const orders = await Order.findAll({
            where: { supplierId },
            include: ['Reseller', 'Product'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
}

module.exports = {
    register,
    login,
    createProduct,
    getMyProducts,
    getIncomingOrders
};