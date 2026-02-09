const { Product, Supplier, Rating, Reseller } = require('../models');
const { Op } = require('sequelize');

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

// Get single product details with Ratings
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Supplier,
                    attributes: ['name', 'companyName', 'walletAddress']
                },
                {
                    model: Rating,
                    include: [{ model: Reseller, attributes: ['name', 'storeName'] }]
                }
            ]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Add Rating
const addRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { resellerId, rating, comment } = req.body;
        
        const newRating = await Rating.create({
            productId: id,
            resellerId,
            rating,
            comment
        });
        
        res.status(201).json(newRating);
    } catch (error) {
        res.status(500).json({ message: 'Error adding rating', error: error.message });
    }
};

// Soft Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.destroy({ where: { id } });
        res.status(200).json({ message: 'Product moved to trash' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

// Get Deleted Products (Trash) for a Supplier
const getDeletedProducts = async (req, res) => {
    try {
        const { supplierId } = req.query;
        const products = await Product.findAll({
            where: { 
                supplierId,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false // Include soft-deleted records
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trash', error: error.message });
    }
};

// Restore Product
const restoreProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.restore({ where: { id } });
        res.status(200).json({ message: 'Product restored' });
    } catch (error) {
        res.status(500).json({ message: 'Error restoring product', error: error.message });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category } = req.body;
        
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let imageUrl = product.imageUrl;
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        await product.update({
            name, description, price, stock, category, imageUrl
        });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    addRating,
    deleteProduct,
    getDeletedProducts,
    restoreProduct,
    updateProduct
};