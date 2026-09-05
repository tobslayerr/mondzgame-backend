// controllers/adminSettingController.js
const AdminSetting = require('../models/AdminSetting');

// GET: Ambil pengaturan admin (Publik/User & Admin)
exports.getAdminSettings = async (req, res) => {
    try {
        let setting = await AdminSetting.findOne();
        if (!setting) {
            // Auto-seed jika belum ada
            setting = await AdminSetting.create({ whatsappAdminNumber: '+6283117420946' });
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan admin', error: error.message });
    }
};

// PUT: Update pengaturan admin (Hanya Admin)
exports.updateAdminSettings = async (req, res) => {
    try {
        const { whatsappAdminNumber } = req.body;
        
        let setting = await AdminSetting.findOne();
        if (!setting) {
            setting = new AdminSetting({ whatsappAdminNumber });
        } else {
            setting.whatsappAdminNumber = whatsappAdminNumber;
        }

        await setting.save();

        res.status(200).json({
            success: true,
            message: 'Nomor WhatsApp admin berhasil diperbarui',
            data: setting
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan', error: error.message });
    }
};