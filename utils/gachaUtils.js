// utils/gachaUtils.js
const { v4: uuidv4 } = require('uuid');

// --- PERUBAHAN DI SINI ---
// Fungsi generateRandomNumberOption, generateGachaNumberOptions, 
// generateRandomSingleColor, dan generateGachaColorOptions dihapus.
// --- AKHIR PERUBAHAN ---


// Function to generate a unique gacha token
const generateGachaToken = () => {
    return uuidv4();
};

module.exports = {
    // Ekspor fungsi yang lama dihapus
    generateGachaToken
};