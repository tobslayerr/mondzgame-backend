// utils/sendAlertEmail.js
const nodemailer = require('nodemailer');

const sendIntruderAlert = async (ipAddress, emailAttempted) => {
    try {
        // Konfigurasi Transporter dengan Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const timeNow = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        // Template HTML Email Peringatan
        const mailOptions = {
            from: `"MondzStore Security" <${process.env.GMAIL_USER}>`,
            to: process.env.ALERT_RECEIVER_EMAIL,
            subject: '⚠️ PERINGATAN KEAMANAN: Upaya Login Superadmin Mencurigakan',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">⚠️ Peringatan Keamanan</h2>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <p style="font-size: 16px; color: #333;">Halo,</p>
                        <p style="font-size: 14px; color: #555;">Sistem kami mendeteksi <strong>3 kali kegagalan login berturut-turut</strong> pada panel Superadmin (Pengaturan & Pembayaran).</p>
                        
                        <div style="background-color: #fff; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Waktu Kejadian:</strong> ${timeNow} WIB</p>
                            <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
                            <p style="margin: 5px 0;"><strong>Email yang dicoba:</strong> ${emailAttempted}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #555;">Sebagai tindakan pencegahan keamanan, alamat IP ini telah diblokir sementara dari upaya login Superadmin selama 15 menit.</p>
                        <p style="font-size: 14px; color: #555;">Jika ini adalah Anda yang lupa password, silakan tunggu 15 menit. Jika bukan Anda, abaikan email ini karena sistem lapis kedua telah menahan peretas.</p>
                    </div>
                    <div style="background-color: #eeeeee; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                        &copy; ${new Date().getFullYear()} MondzStore System. Automated Security Message.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[SECURITY] Alert email sent successfully to ${process.env.ALERT_RECEIVER_EMAIL}`);
    } catch (error) {
        console.error('[SECURITY ERROR] Failed to send alert email:', error);
    }
};

module.exports = sendIntruderAlert;