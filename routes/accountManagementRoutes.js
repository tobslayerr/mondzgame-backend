// routes/accountManagementRoutes.js
const express = require('express');
const router = express.Router();
const accountManagementController = require('../controllers/accountManagementController');
// const authMiddleware = require('../middlewares/authMiddleware'); // (Jika Anda punya auth admin)

// @route   POST /api/user/request-verification
// @desc    User requests verification for their claimed account
router.post('/request-verification', accountManagementController.requestAccountVerification);

module.exports = router;