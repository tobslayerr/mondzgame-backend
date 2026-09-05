// controllers/packageConfigController.js
const PackageConfig = require('../models/PackageConfig');

// Konfigurasi default awal jika database masih kosong
const defaultConfigs = [
    { packageAmount: 50000, weights: { Nova: 48, Pulse: 36, Flux: 15, Radiant: 1 }, description: 'Paket Rp 50.000' },
    { packageAmount: 100000, weights: { Nova: 0, Pulse: 30, Flux: 50, Radiant: 20 }, description: 'Paket Rp 100.000' },
    { packageAmount: 150000, weights: { Nova: 0, Pulse: 0, Flux: 40, Radiant: 60 }, description: 'Paket Rp 150.000' }
];

// GET: Ambil semua pengaturan probabilitas paket
exports.getPackageConfigs = async (req, res) => {
    try {
        let configs = await PackageConfig.find();
        if (configs.length === 0) {
            configs = await PackageConfig.insertMany(defaultConfigs);
        }
        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat konfigurasi paket', error: error.message });
    }
};

// PUT: Perbarui bobot probabilitas berdasarkan nominal paket
exports.updatePackageConfig = async (req, res) => {
    try {
        const { amount } = req.params;
        const { weights } = req.body;

        let config = await PackageConfig.findOne({ packageAmount: Number(amount) });
        if (!config) {
            config = new PackageConfig({ packageAmount: Number(amount), weights });
        } else {
            config.weights = weights;
        }

        await config.save();
        res.status(200).json({ 
            success: true, 
            message: `Probabilitas paket Rp ${Number(amount).toLocaleString('id-ID')} berhasil diperbarui!`, 
            data: config 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memperbarui probabilitas paket', error: error.message });
    }
};