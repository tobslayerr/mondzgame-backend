// controllers/accountManagementController.js
const Account = require('../models/Account');
const GachaLink = require('../models/GachaLink');

const getTimestamp = () => new Date().toLocaleString('en-GB', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

// --- SEMUA FUNGSI USER (requestVerification, releaseAccount, confirmTakeAccount) DIHAPUS ---


// --- FUNGSI ADMIN (undoClaim, undoRelease) DIHAPUS ---


// @route   DELETE /api/admin/accounts/:id (INI DIPINDAH DARI adminController)
// @desc    (Admin) Delete an account permanently
// @access  Private (Admin only)
// JIKA FUNGSI INI SUDAH ADA DI adminController.js, ANDA BISA HAPUS FILE INI
// TAPI JIKA MASIH DI SINI, KITA BIARKAN
exports.deleteAccountPermanently = async (req, res) => {
    const timestamp = getTimestamp();
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            console.warn(`[${timestamp}] [ADMIN WARN] Delete request for non-existent account ID: ${req.params.id}.`);
            return res.status(404).json({ msg: 'Akun tidak ditemukan.' });
        }
        
        // Admin kini hanya bisa hapus akun 'available'
        if (account.status !== 'available') {
             console.warn(`[${timestamp}] [ADMIN WARN] Admin attempt to delete non-available account ID: ${req.params.id}.`);
             return res.status(400).json({ msg: 'Hanya akun berstatus "Tersedia" yang bisa dihapus.' });
        }
        
        await Account.deleteOne({ _id: req.params.id });
        console.log(`[${timestamp}] [ADMIN INFO] Admin permanently deleted account ID: ${req.params.id}.`);

        res.json({ msg: 'Akun berhasil dihapus permanen.' });

    } catch (err) {
        console.error(`[${timestamp}] [ADMIN ERROR] Error deleting account ${req.params.id}:`, err.message, err.stack);
        res.status(500).json({ msg: 'Server Error saat menghapus akun.', details: err.message });
    }
};
