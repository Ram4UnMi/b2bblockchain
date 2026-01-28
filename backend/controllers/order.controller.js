const { Order, Product, Supplier, Reseller } = require('../models');

// Create Order (Initially Pending)
const createOrder = async (req, res) => {
    try {
        const { resellerId, supplierId, productId, quantity, totalPrice } = req.body;

        // Check stock
        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

        const order = await Order.create({
            resellerId,
            supplierId,
            productId,
            quantity,
            totalPrice,
            status: 'pending'
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Confirm Payment (Called after blockchain tx success)
const confirmPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { txHash } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'paid';
        order.txHash = txHash;
        await order.save();

        // Reduce stock
        const product = await Product.findByPk(order.productId);
        if (product) {
            product.stock -= order.quantity;
            await product.save();
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error confirming payment', error: error.message });
    }
};

module.exports = {
    createOrder,
    confirmPayment
};