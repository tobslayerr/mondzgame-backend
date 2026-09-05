const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMidlleware');
const adminController = require('../controllers/adminController');
const accountManagementController = require('../controllers/accountManagementController');

// --- Admin Account Creation ---
router.post('/accounts/add', auth, adminController.addAccount);

// --- Admin Account Listing ---
router.get('/accounts', auth, adminController.viewAccounts);

router.delete('/accounts/:id', auth, accountManagementController.deleteAccountPermanently);

// @route   GET /api/admin/gacha-links (tetap ada untuk melihat link yang dibuat)
// @desc    View list of created gacha links
// @access  Private (Admin only)
router.get('/gacha-links', auth, adminController.viewGachaLinks);

module.exports = router;
