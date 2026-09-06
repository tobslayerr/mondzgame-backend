// routes/superadminRoutes.js
const express = require('express');
const router = express.Router();
const { superadminLogin, verifyOtp } = require('../controllers/superadminController');

// Hanya ada 2 rute ini di file superadmin
router.post('/login', superadminLogin);
router.post('/verify-otp', verifyOtp);

module.exports = router;