const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    grossAmount: {
        type: Number,
        required: true
    },
    customerEmail: { // Email dari user yang membuat invoice
        type: String,
        required: true
    },
    isPaid: { // Status pembayaran manual oleh admin
        type: Boolean,
        default: false
    },
    gachaLink: { // Reference to the generated gacha link (bisa null jika belum digenerate)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GachaLink',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
