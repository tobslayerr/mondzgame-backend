// routes/superadminRoutes.js
const express = require('express');
const router = express.Router();
const { superadminLogin, verifyOtp } = require('../controllers/superadminController');

router.post('/login', superadminLogin);
router.post('/verify-otp', verifyOtp); // Endpoint baru

module.exports = router;