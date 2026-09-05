require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Account = require('../models/Account'); // Pastikan path ke model Account benar

// Fungsi untuk menghubungkan ke MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for seeding accounts...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Fungsi untuk membuat akun dummy
const createDummyAccount = (type, index) => {
    return {
        email: `${type}${index}@gacha.test`,
        password: `${type}pass${index}`, // Password sederhana untuk akun dummy
        type: type,
        status: 'available', // Semua akun baru tersedia
        givenTo: null
    };
};

// Fungsi utama untuk seeding akun
const seedAccounts = async () => {
    await connectDB();

    const numAccounts = 500; // Jumlah akun per tipe

    try {
        console.log(`Starting to seed ${numAccounts} jackpot and ${numAccounts} ampas accounts...`);

        // Hapus akun yang sudah ada (hanya akun dummy yang dibuat script ini, atau semua jika Anda ingin bersih total)
        // PERINGATAN: Menghapus semua akun yang ada!
        // Jika Anda hanya ingin menambahkan dan tidak menghapus yang sudah ada, Anda bisa komen baris ini.
        console.log('Clearing existing accounts...');
        await Account.deleteMany({});
        console.log('Existing accounts cleared.');

        const accountsToInsert = [];

        // Buat akun jackpot
        for (let i = 1; i <= numAccounts; i++) {
            accountsToInsert.push(createDummyAccount('jackpot', i));
        }

        // Buat akun ampas
        for (let i = 1; i <= numAccounts; i++) {
            accountsToInsert.push(createDummyAccount('ampas', i));
        }

        console.log(`Inserting ${accountsToInsert.length} accounts...`);
        await Account.insertMany(accountsToInsert);
        console.log('Accounts seeded successfully!');

    } catch (err) {
        console.error('Error seeding accounts:', err.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

seedAccounts();