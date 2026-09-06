// utils/sendOtpEmail.js
const nodemailer = require('nodemailer');

const sendOtpEmail = async (otpCode) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: `"MondzStore Security" <${process.env.GMAIL_USER}>`,
            to: process.env.ALERT_RECEIVER_EMAIL, // Email Hardcoded Anda
            subject: `Kode OTP Superadmin: ${otpCode}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center;">
                        <h2 style="margin: 0;">Verifikasi Login Lapis Kedua</h2>
                    </div>
                    <div style="padding: 20px; background-color: #f8f9fa; text-align: center;">
                        <p style="font-size: 14px; color: #555;">Gunakan kode OTP berikut untuk mengakses Pengaturan Sistem.</p>
                        <div style="margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d32f2f;">
                            ${otpCode}
                        </div>
                        <p style="font-size: 12px; color: #888;">Kode ini akan kedaluwarsa dalam 5 menit.</p>
                        <p style="font-size: 12px; color: #888;">JANGAN BERIKAN KODE INI KEPADA SIAPAPUN.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[OTP] Dikirim ke ${process.env.ALERT_RECEIVER_EMAIL}`);
    } catch (error) {
        console.error('[OTP ERROR] Gagal mengirim email OTP:', error);
    }
};

module.exports = sendOtpEmail;