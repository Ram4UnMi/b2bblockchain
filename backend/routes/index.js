const express = require('express');
const router = express.Router();

const supplierRoutes = require('./supplier.routes');
const resellerRoutes = require('./reseller.routes');
const orderRoutes = require('./order.routes');
const productRoutes = require('./product.routes');

router.use('/suppliers', supplierRoutes);
router.use('/resellers', resellerRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);

module.exports = router;