const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getAllProducts);
router.get('/trash', productController.getDeletedProducts); // Must be before /:id
router.get('/:id', productController.getProductById);
router.post('/:id/rate', productController.addRating);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/restore', productController.restoreProduct);

module.exports = router;