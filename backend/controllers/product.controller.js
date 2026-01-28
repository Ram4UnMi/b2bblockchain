const { Product, Supplier } = require('../models');

// Get all products (Marketplace view)
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{
                model: Supplier,
                attributes: ['name', 'companyName', 'walletAddress']
            }]
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Get single product details
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [{
                model: Supplier,
                attributes: ['name', 'companyName', 'walletAddress']
            }]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById
};