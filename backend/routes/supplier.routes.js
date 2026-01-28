const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');

router.post('/register', supplierController.register);
router.post('/login', supplierController.login);
router.post('/products', supplierController.createProduct);
router.get('/:supplierId/products', supplierController.getMyProducts);
router.get('/:supplierId/orders', supplierController.getIncomingOrders);

module.exports = router;