// routes/playerConfigRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getPlayerConfigs, 
    updatePlayerConfig, 
    uploadPlayerImage 
} = require('../controllers/playerConfigController');

// Mengimpor middleware auth tunggal yang Anda miliki
const auth = require('../middlewares/authMidlleware'); 
const { upload } = require('../config/cloudinary');

// Endpoint Publik: Mengambil konfigurasi pemain
router.get('/', getPlayerConfigs);

// Endpoint Admin: Mengunggah gambar (Dilindungi oleh middleware auth tunggal)
router.post('/upload', auth, upload.single('image'), uploadPlayerImage);

// Endpoint Admin: Memperbarui konfigurasi tier berdasarkan parameter tier (Dilindungi oleh auth)
router.put('/:tier', auth, updatePlayerConfig);

module.exports = router;