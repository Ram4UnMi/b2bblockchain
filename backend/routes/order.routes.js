const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.post('/', orderController.createOrder);
router.post('/:id/confirm', orderController.confirmPayment);

module.exports = router;