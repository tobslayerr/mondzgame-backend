// models/PlayerConfig.js
const mongoose = require('mongoose');

const playerConfigSchema = new mongoose.Schema({
    tier: {
        type: String,
        required: true,
        unique: true,
        enum: ['a', 'b', 'c', 'd'] // Menambahkan tier 'd'
    },
    images: {
        type: [String], // Array berisi path/URL gambar pemain
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('PlayerConfig', playerConfigSchema);