const mongoose = require('mongoose');

const cancelledOrderSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    cancelledAt: {
        type: Date,
        default: Date.now
    }
});

exports.CancelledOrder = mongoose.model('CancelledOrder', cancelledOrderSchema);
