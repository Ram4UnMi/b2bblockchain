const { Reseller, Order } = require('../models');

// Register Reseller
const register = async (req, res) => {
    try {
        const { name, email, password, walletAddress, storeName } = req.body;
        const existing = await Reseller.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const reseller = await Reseller.create({ name, email, password, walletAddress, storeName });
        res.status(201).json(reseller);
    } catch (error) {
        res.status(500).json({ message: 'Error registering reseller', error: error.message });
    }
};

// Login Reseller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const reseller = await Reseller.findOne({ where: { email, password } });
        if (!reseller) return res.status(401).json({ message: 'Invalid credentials' });
        
        res.status(200).json(reseller);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Get My Orders
const getMyOrders = async (req, res) => {
    try {
        const { resellerId } = req.params;
        const orders = await Order.findAll({
            where: { resellerId },
            include: ['Supplier', 'Product'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getMyOrders
};