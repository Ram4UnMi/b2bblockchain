const express = require('express');
const router = express.Router();
const resellerController = require('../controllers/reseller.controller');

router.post('/register', resellerController.register);
router.post('/login', resellerController.login);
router.get('/:resellerId/orders', resellerController.getMyOrders);

module.exports = router;