// middlewares/superadminAuth.js
const jwt = require('jsonwebtoken');

const superadminAuth = (req, res, next) => {
    // Ambil token dari header Authorization (Format: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ success: false, msg: 'Akses ditolak. Token Superadmin tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'superadmin_fallback_secret');
        
        if (decoded.role !== 'superadmin') {
            return res.status(403).json({ success: false, msg: 'Akses ditolak. Role tidak valid.' });
        }

        req.superadmin = decoded; // Lolos verifikasi
        next();
    } catch (error) {
        return res.status(401).json({ success: false, msg: 'Sesi Superadmin telah habis. Silakan verifikasi ulang.' });
    }
};

module.exports = superadminAuth;