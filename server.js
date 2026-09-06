require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Pastikan ini diimpor
const helmet = require('helmet'); // Import helmet
const rateLimit = require('express-rate-limit'); // Import rate-limit

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const gachaRoutes = require('./routes/gachaRoutes');
const paymentSettingRoutes = require('./routes/paymentSettingRoutes');
const adminSettingRoutes = require('./routes/adminSettingRoutes');
const playerConfigRoutes = require('./routes/playerConfigRoutes');
const packageConfigRoutes = require('./routes/packageConfigRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const superadminAuth = require('./middlewares/superadminAuth');

const app = express();

// --- Security Middlewares ---
app.use(helmet()); // Terapkan header keamanan HTTP

// Helper untuk mendapatkan timestamp
const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('en-GB', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Connect Database
connectDB();

// --- Konfigurasi CORS ---
const allowedOrigins = [
    'https://mondzgame.vercel.app', 
    'http://localhost:5173'        
];

const corsOptions = {
    origin: function (origin, callback) {
        // Izinkan permintaan tanpa origin (misalnya, dari Postman, curl, same-origin)
        // atau jika origin ada di daftar allowedOrigins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`[${getTimestamp()}] CORS BLOCKED: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'), false); // Tolak origin lain
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Metode HTTP yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], // Header yang diizinkan
    credentials: true // Izinkan cookies dan header otorisasi (jika Anda menggunakannya)
};

app.use(cors(corsOptions)); 

app.use(bodyParser.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 15, // Batasi 15 percobaan login per IP dalam 15 menit
  message: { msg: 'Terlalu banyak percobaan login dari IP ini, coba lagi setelah 15 menit' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/auth/login', loginLimiter);

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', invoiceRoutes); 
app.use('/api/gacha', gachaRoutes);
app.use('/api/payment-settings', paymentSettingRoutes);
app.use('/api/admin-settings', adminSettingRoutes);
app.use('/api/player-configs', playerConfigRoutes);
app.use('/api/package-configs', packageConfigRoutes);
app.use('/api/superadmin', superadminRoutes);

// Basic route untuk cek server
app.get('/', (req, res) => {
    res.send('Gacha Backend API is running...');
});

// Middleware Penanganan Error (Harus diletakkan paling bawah)
app.use((err, req, res, next) => {
    const timestamp = getTimestamp();
    console.error(`[${timestamp}] [SERVER ERROR]`, err.message); 
    // Jangan kirim stack trace ke client di production
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        console.error(err.stack);
    }

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ msg: 'Akses ditolak oleh kebijakan CORS.' });
    }

    if (err && err.errors && Array.isArray(err.errors)) {
        return res.status(400).json({ errors: err.errors });
    }

    res.status(500).json({ msg: 'Terjadi kesalahan pada server.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
