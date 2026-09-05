const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMidlleware');
const invoiceController = require('../controllers/invoiceController');

// --- User Routes ---
router.post('/user/invoice', invoiceController.createUserInvoice);
router.get('/invoices/:id', invoiceController.getInvoiceDetails);

// --- Admin Routes ---
router.get('/admin/invoices', auth, invoiceController.viewInvoices);
router.put('/admin/invoices/:id/approve-generate-gacha-link', auth, invoiceController.approveAndGenerateGachaLink);
router.get('/admin/invoices/report', auth, invoiceController.getInvoiceReport);

// --- RUTE BARU UNTUK HAPUS INVOICE PENDING ---
// @route   DELETE /api/admin/invoices/:id
// @desc    Admin deletes a pending invoice
// @access  Private (Admin only)
router.delete('/admin/invoices/:id', auth, invoiceController.deletePendingInvoice);
// --- AKHIR RUTE BARU ---


module.exports = router;