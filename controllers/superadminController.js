// controllers/superadminController.js
const jwt = require('jsonwebtoken');
const sendIntruderAlert = require('../utils/sendAlertEmail');
const sendOtpEmail = require('../utils/sendOtpEmail');

const failedLoginAttempts = new Map(); 
const activeOtps = new Map(); // Menyimpan OTP sementara

const MAX_ATTEMPTS = 3;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 menit blokir
const SESSION_LIFETIME = '15m'; // Token & Sesi aktif hanya 15 menit

exports.superadminLogin = async (req, res) => {
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // 1. Cek Blokir 3x Gagal
    if (failedLoginAttempts.has(ip)) {
        const attemptData = failedLoginAttempts.get(ip);
        if (attemptData.lockedUntil && attemptData.lockedUntil > Date.now()) {
            const timeLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / 60000);
            return res.status(429).json({ success: false, msg: `Akses diblokir. Coba lagi dalam ${timeLeft} menit.` });
        }
        if (attemptData.lockedUntil && attemptData.lockedUntil <= Date.now()) {
            failedLoginAttempts.delete(ip);
        }
    }

    // 2. Validasi Password
    const isEmailMatch = email === process.env.SUPERADMIN_EMAIL;
    const isPasswordMatch = password === process.env.SUPERADMIN_PASSWORD;

    if (isEmailMatch && isPasswordMatch) {
        failedLoginAttempts.delete(ip);

        // GENERATE OTP (6 Digit)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Simpan OTP di memori, berlaku 5 menit
        activeOtps.set(email, { otp: otpCode, expiresAt: Date.now() + 5 * 60 * 1000 });

        // Tembak Email OTP
        sendOtpEmail(otpCode).catch(console.error);

        return res.status(200).json({
            success: true,
            msg: 'Password benar. Cek email untuk OTP.',
            requiresOtp: true // Memberitahu frontend untuk pindah ke layar OTP
        });
    }

    // 3. JIKA GAGAL LOGIN
    let attempts = failedLoginAttempts.has(ip) ? failedLoginAttempts.get(ip).count : 0;
    attempts += 1;

    if (attempts >= MAX_ATTEMPTS) {
        failedLoginAttempts.set(ip, { count: attempts, lockedUntil: Date.now() + LOCK_TIME_MS });
        sendIntruderAlert(ip, email).catch(console.error);
        return res.status(401).json({ success: false, msg: '3x Gagal! Akses ditahan dan Peringatan Email telah dikirim.' });
    } else {
        failedLoginAttempts.set(ip, { count: attempts, lockedUntil: null });
        return res.status(401).json({ success: false, msg: `Kredensial salah. Sisa mencoba: ${MAX_ATTEMPTS - attempts}x` });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const record = activeOtps.get(email);

    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
        return res.status(401).json({ success: false, msg: 'Kode OTP salah atau sudah kedaluwarsa.' });
    }

    // JIKA OTP BENAR
    activeOtps.delete(email); // Hapus OTP agar tidak bisa dipakai 2x

    const superadminToken = jwt.sign(
        { role: 'superadmin', email: email }, 
        process.env.JWT_SECRET || 'superadmin_fallback_secret', 
        { expiresIn: SESSION_LIFETIME }
    );

    return res.status(200).json({
        success: true,
        msg: 'Akses Diberikan.',
        superadminToken,
        expiresInMs: 15 * 60 * 1000 // Beritahu frontend sesi 15 menit
    });
};