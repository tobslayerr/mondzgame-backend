// models/AdminSetting.js
const mongoose = require('mongoose');

const adminSettingSchema = new mongoose.Schema({
    whatsappAdminNumber: {
        type: String,
        required: true,
        default: '+6283117420946'
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminSetting', adminSettingSchema);