// controllers/playerConfigController.js
const PlayerConfig = require('../models/PlayerConfig');

// GET: Ambil semua konfigurasi gambar pemain
exports.getPlayerConfigs = async (req, res) => {
    try {
        let configs = await PlayerConfig.find();
        if (configs.length === 0) {
            const defaultTiers = ['a', 'b', 'c', 'd'];
            const initialDocs = defaultTiers.map(tier => ({ tier, images: [] }));
            configs = await PlayerConfig.insertMany(initialDocs);
        }
        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data pemain', error: error.message });
    }
};

// PUT: Perbarui gambar pemain berdasarkan tier
exports.updatePlayerConfig = async (req, res) => {
    try {
        const { tier } = req.params; 
        const { images } = req.body; 

        let config = await PlayerConfig.findOne({ tier });
        if (!config) {
            config = new PlayerConfig({ tier, images: images || [] });
        } else {
            config.images = images;
        }

        await config.save();
        res.status(200).json({ success: true, message: `Tier ${tier.toUpperCase()} berhasil diperbarui`, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memperbarui konfigurasi pemain', error: error.message });
    }
};

// POST: Upload file gambar via drag & drop / file picker
exports.uploadPlayerImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
        }
        // req.file.path berisi URL hasil upload dari Cloudinary multer config Anda
        const imageUrl = req.file.path;
        res.status(200).json({ success: true, url: imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengunggah gambar', error: error.message });
    }
};