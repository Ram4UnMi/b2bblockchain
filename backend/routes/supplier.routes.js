const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const upload = require('../middleware/upload');

router.post('/register', supplierController.register);
router.post('/login', supplierController.login);
router.post('/products', upload.single('image'), supplierController.createProduct);
router.get('/:supplierId/products', supplierController.getMyProducts);
router.get('/:supplierId/orders', supplierController.getIncomingOrders);
router.put('/:supplierId', supplierController.updateProfile);

module.exports = router;