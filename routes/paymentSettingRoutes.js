// routes/paymentSettingsRoutes.js (Atau nama file route pembayaran Anda)
const express = require('express');
const router = express.Router();

// 1. Import middleware pelindung superadmin
const superadminAuth = require('../middlewares/superadminAuth');

// 2. Import controller pembayaran (PASTIKAN NAMA FUNGSINYA SESUAI DENGAN CONTROLLER ANDA)
// Contoh di bawah menggunakan getPaymentSettings dan updatePaymentSettings
const { 
    getPaymentSettings, 
    updatePaymentSetting
} = require('../controllers/paymentSettingController');

// Rute GET (Publik) -> Untuk pembeli melihat rekening di form Invoice
router.get('/', getPaymentSettings);

// Rute PUT/POST (Terlindungi) -> Untuk Superadmin menyimpan pengaturan
router.put('/', superadminAuth, updatePaymentSetting); 
router.post('/', superadminAuth, updatePaymentSetting); // Pakai POST jika frontend Anda pakai API.post

module.exports = router;