// models/PackageConfig.js
const mongoose = require('mongoose');

const packageConfigSchema = new mongoose.Schema({
    packageAmount: { type: Number, required: true, unique: true }, // Contoh: 50000, 100000, 150000
    weights: {
        Nova: { type: Number, default: 0 },
        Pulse: { type: Number, default: 0 },
        Flux: { type: Number, default: 0 },
        Radiant: { type: Number, default: 0 }
    },
    description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('PackageConfig', packageConfigSchema);