const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator'); 

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login',
    [
        // Validasi input sebelum controller dijalankan
        body('email', 'Masukkan email yang valid').isEmail().normalizeEmail(), // Cek format email & bersihkan
        body('password', 'Password minimal 6 karakter').isLength({ min: 6 })    // Cek panjang password
    ],
    authController.login // Panggil controller jika validasi lolos (pengecekan error ada di controller)
);

module.exports = router;