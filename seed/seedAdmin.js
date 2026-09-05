require('dotenv').config({ path: __dirname + '/../.env' }); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for seeding...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env file.');
        process.exit(1);
    }

    try {
        let adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            console.log('Admin user already exists. Updating password if necessary.');
            const isMatch = await bcrypt.compare(adminPassword, adminUser.password);
            if (!isMatch) {
                 const salt = await bcrypt.genSalt(10);
                 adminUser.password = await bcrypt.hash(adminPassword, salt);
                 await adminUser.save();
                 console.log('Admin password updated.');
            } else {
                 console.log('Admin user already exists with the same password.');
            }

        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            adminUser = new User({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await adminUser.save();
            console.log('Admin user created successfully!');
        }

    } catch (err) {
        console.error('Error seeding admin user:', err.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

seedAdmin();