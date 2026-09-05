const express = require('express');
const router = express.Router();
const { getPaymentSettings, updatePaymentSetting } = require('../controllers/paymentSettingController');
const { upload } = require('../config/cloudinary');

// Sesuaikan dengan nama fungsi middleware otentikasi admin Anda yang ada di middlewares/authMidlleware.js
const { verifyToken, isAdmin } = require('../middlewares/authMidlleware'); 

// Endpoint Publik: Mengambil data pembayaran untuk ditampilkan di frontend
router.get('/', getPaymentSettings);

// Endpoint Admin: Memperbarui data (menggunakan multer upload.single('image') untuk menangani file gambar QRIS)
// Parameter 'image' adalah nama field dari form-data frontend nantinya
router.put('/:id', upload.single('image'), updatePaymentSetting);

module.exports = router;