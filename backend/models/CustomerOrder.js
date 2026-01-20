const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerOrderSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'ResellerProduct',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CustomerOrder', CustomerOrderSchema);
