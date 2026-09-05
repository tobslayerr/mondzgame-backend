// routes/packageConfigRoutes.js
const express = require('express');
const router = express.Router();
const { getPackageConfigs, updatePackageConfig } = require('../controllers/packageConfigController');
const auth = require('../middlewares/authMidlleware');

router.get('/', getPackageConfigs);
router.put('/:amount', auth, updatePackageConfig);

module.exports = router;