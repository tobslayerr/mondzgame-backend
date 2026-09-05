const PaymentSetting = require('../models/PaymentSetting');

// GET: Ambil semua pengaturan pembayaran (Digunakan oleh User & Admin)
exports.getPaymentSettings = async (req, res) => {
    try {
        // Auto-seed: Jika collection kosong, buat data default
        const count = await PaymentSetting.countDocuments();
        if (count === 0) {
            const defaultSettings = [
                { method: 'BCA', accountName: 'Admin BCA', accountNumber: '1234567890' },
                { method: 'GOPAY', accountName: 'Admin Gopay', accountNumber: '081234567890' },
                { method: 'OVO', accountName: 'Admin OVO', accountNumber: '081234567890' },
                { method: 'SEABANK', accountName: 'Admin SeaBank', accountNumber: '1234567890' },
                { method: 'QRIS', accountName: 'Mondzgame', imageUrl: '' }
            ];
            await PaymentSetting.insertMany(defaultSettings);
        }

        const settings = await PaymentSetting.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data pengaturan', error: error.message });
    }
};

// PUT: Update pengaturan pembayaran (Hanya Admin)
exports.updatePaymentSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountName, accountNumber, isActive } = req.body;
        
        let updateData = {
            accountName,
            accountNumber,
            isActive: isActive === 'true' || isActive === true
        };

        // Jika ada file gambar yang diupload (berarti ini QRIS)
        if (req.file) {
            updateData.imageUrl = req.file.path; // URL gambar dari Cloudinary
        }

        const updatedSetting = await PaymentSetting.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedSetting) {
            return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Pengaturan pembayaran berhasil diperbarui', 
            data: updatedSetting 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan', error: error.message });
    }
};