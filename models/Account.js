// models/Account.js
const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tier: {
        type: String,
        enum: ['Nova', 'Pulse', 'Flux', 'Radiant'],
        required: [true, 'Tier (Nova, Pulse, Flux, Radiant) wajib diisi']
    },
    // --- PERUBAHAN: Hanya status 'available' ---
    status: {
        type: String,
        enum: ['available'], // Hanya 'available'
        default: 'available'
    },
    // --- AKHIR PERUBAHAN ---
    
    // givenTo tidak lagi relevan karena akun dihapus
    givenTo: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GachaLink',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Account', AccountSchema);


module.exports = mongoose.model('Account', AccountSchema);
