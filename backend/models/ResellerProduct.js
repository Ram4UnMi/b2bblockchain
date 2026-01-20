const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResellerProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    resellerId: {
        type: String, // or Schema.Types.ObjectId if you have a Reseller collection
        required: true
    }
});

module.exports = mongoose.model('ResellerProduct', ResellerProductSchema);
