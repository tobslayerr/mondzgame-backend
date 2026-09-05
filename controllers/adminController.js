// controllers/adminController.js
const Account = require('../models/Account');
const GachaLink = require('../models/GachaLink');
const Invoice = require('../models/Invoice');
// const bcrypt = require('bcrypt'); // <-- Dihapus, tidak lagi digunakan di file ini

const getTimestamp = () => new Date().toLocaleString('en-GB', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

// @route   POST /api/admin/accounts/add
// @desc    (MODIFIKASI) Menambah akun baru ATAU memperbarui akun lama (claimed/released)
// @access  Private (Admin only)
exports.addAccount = async (req, res) => {
    const { email, password, tier } = req.body;

    if (!email || !password || !tier) {
        return res.status(400).json({ msg: 'Harap masukkan email, password, dan Tipe Akun (tier).' });
    }
    // Validasi tier baru
    if (!['Nova', 'Pulse', 'Flux', 'Radiant'].includes(tier)) {
         return res.status(400).json({ msg: `Tier tidak valid: ${tier}. Pastikan (Nova, Pulse, Flux, Radiant).` });
    }

    try {
        let account = await Account.findOne({ email });

        // --- PERUBAHAN LOGIKA DI SINI ---
        // Hashing password dihapus. Kita akan gunakan 'password' (plain text)
        // const salt = await bcrypt.genSalt(10); // <-- Dihapus
        // const hashedPassword = await bcrypt.hash(password, salt); // <-- Dihapus

        if (account) {
            // 2. Akun dengan email ini DITEMUKAN
            
            // 2a. Cek apakah statusnya 'available'
            if (account.status === 'available') {
                // Jika masih tersedia, jangan timpa. Beri error.
                console.warn(`[${getTimestamp()}] [ADMIN] Gagal: Akun ${email} sudah ada dan masih tersedia.`);
                return res.status(400).json({ msg: 'Akun dengan email ini sudah ada dan statusnya masih "Tersedia". Tidak bisa ditimpa.' });
            }

            // 2b. Jika statusnya 'claimed', 'pending_verification', atau 'released' (jika masih ada)
            // Kita "Recycle" akun ini.
            console.log(`[${getTimestamp()}] [ADMIN] Akun ${email} (Status: ${account.status}) ditemukan. Memperbarui dan mengembalikan ke 'available'.`);
            
            account.password = password; // <-- Simpan plain text
            account.tier = tier;
            account.status = 'available'; // Kembalikan status ke 'available'
            account.givenTo = null; // Hapus referensi gacha link sebelumnya

            await account.save();

            return res.status(200).json({ msg: 'Akun yang sudah terpakai berhasil diperbarui dan dikembalikan ke "Tersedia".', account });

        } else {
            // 3. Akun dengan email ini TIDAK DITEMUKAN (Buat baru)
            account = new Account({
                email,
                password: password, // <-- Simpan plain text
                tier,
                status: 'available'
            });

            await account.save();
            console.log(`[${getTimestamp()}] [ADMIN] Akun baru berhasil ditambahkan: ${email} (Tier: ${tier})`);
            return res.status(201).json({ msg: 'Akun baru berhasil ditambahkan', account });
        }
        // --- AKHIR PERUBAHAN LOGIKA ---

    } catch (err) {
        if (err.name === 'ValidationError') {
             console.error(`[${getTimestamp()}] [ADMIN ERROR] Validation error adding account:`, err.message);
             return res.status(400).json({ msg: `Data tidak valid: ${err.message}.` });
        }
        console.error(`[${getTimestamp()}] [ADMIN ERROR] Error adding account:`, err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/admin/accounts
// @desc    View list of all accounts with their statuses
// @access  Private (Admin only)
exports.viewAccounts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const { startDate, endDate, statusQuery, tierQuery } = req.query;

        const filterQuery = {};

        // Hanya proses jika statusQuery adalah 'available' (berdasarkan alur baru)
        if (statusQuery === 'available') {
            filterQuery.status = 'available';
        } else {
            // Default ke available jika query aneh
            filterQuery.status = 'available'; 
            if(statusQuery) console.warn(`[${getTimestamp()}] [ADMIN] Invalid status query: ${statusQuery}. Defaulting to 'available'.`);
        }
        
        if (tierQuery && ['Nova', 'Pulse', 'Flux', 'Radiant'].includes(tierQuery)) {
            filterQuery.tier = tierQuery;
        }

        if (startDate || endDate) {
            filterQuery.createdAt = {};
            if (startDate) { const start = new Date(startDate); start.setHours(0, 0, 0, 0); filterQuery.createdAt.$gte = start; }
            if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); filterQuery.createdAt.$lte = end; }
        }

        const totalItems = await Account.countDocuments(filterQuery);
        const accounts = await Account.find(filterQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalPages = Math.ceil(totalItems / limit);
        
        console.log(`[${getTimestamp()}] [ADMIN] Fetched ${accounts.length} accounts (Page: ${page}, Total: ${totalItems}, Status: ${statusQuery}).`);
        
        res.json({
            accounts,
            totalPages,
            currentPage: page,
            totalItems
        });
    } catch (err) {
        console.error(`[${getTimestamp()}] [ADMIN ERROR] Error viewing accounts:`, err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/admin/gacha-links
// @desc    View list of created gacha links
// @access  Private (Admin only)
exports.viewGachaLinks = async (req, res) => {
    try {
        const gachaLinks = await GachaLink.find().populate('invoiceId', 'orderId isPaid').sort({ createdAt: -1 });
        console.log(`[${getTimestamp()}] [ADMIN] Fetched ${gachaLinks.length} gacha links.`);
        res.json(gachaLinks);
    } catch (err) {
        console.error(`[${getTimestamp()}] [ADMIN ERROR] Error viewing gacha links:`, err.message);
        res.status(500).send('Server Error');
    }
};
