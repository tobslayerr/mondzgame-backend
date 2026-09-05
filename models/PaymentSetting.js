const mongoose = require('mongoose');

const paymentSettingSchema = new mongoose.Schema({
    method: { 
        type: String, 
        required: true, 
        unique: true,
        enum: ['GOPAY', 'BCA', 'SEABANK', 'OVO', 'QRIS'] // Validasi metode yang tersedia
    },
    accountName: { 
        type: String, 
        default: '' 
    },
    accountNumber: { 
        type: String, 
        default: '' 
    },
    imageUrl: { 
        type: String, 
        default: null // Khusus untuk QRIS
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentSetting', paymentSettingSchema);