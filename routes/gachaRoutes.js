const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gachaController');

// @route   GET /api/gacha/:token
// @desc    Gacha result handler – validate answer & show prize
// @access  Public
router.get('/:token', gachaController.claimGachaLink);

module.exports = router;
