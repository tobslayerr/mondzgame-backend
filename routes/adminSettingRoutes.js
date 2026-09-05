// routes/adminSettingRoutes.js
const express = require('express');
const router = express.Router();
const { getAdminSettings, updateAdminSettings } = require('../controllers/adminSettingController');
const auth = require('../middlewares/authMidlleware'); // Mengimpor fungsi auth secara langsung

// Endpoint Publik: Mengambil pengaturan admin
router.get('/', getAdminSettings);

// Endpoint Admin: Memperbarui pengaturan admin (Dilindungi oleh middleware auth)
router.put('/', auth, updateAdminSettings);

module.exports = router;