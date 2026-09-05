const GachaLink = require('../models/GachaLink');
const Account = require('../models/Account');
const Invoice = require('../models/Invoice');
const PlayerConfig = require('../models/PlayerConfig'); // Model konfigurasi pemain dinamis

const getTimestamp = () => new Date().toLocaleString('en-GB', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const PLACEHOLDER_IMAGE = '/players/placeholder.webp';

// Fungsi untuk mengambil gambar pemain secara dinamis dari database berdasarkan tier ('a', 'b', 'c', 'd')
const getRandomPlayers = async (targetTier, count, excludeList = []) => {
    try {
        const config = await PlayerConfig.findOne({ tier: targetTier });
        const tierImages = config && config.images.length > 0 ? config.images : [];

        if (tierImages.length === 0) {
            return Array(count).fill(PLACEHOLDER_IMAGE);
        }

        const availablePlayers = tierImages.filter(p => !excludeList.includes(p));
        const selectedPlayers = [];
        let currentAvailable = [...availablePlayers];

        for (let i = 0; i < count; i++) {
            if (currentAvailable.length > 0) {
                const randomIndex = Math.floor(Math.random() * currentAvailable.length);
                selectedPlayers.push(currentAvailable.splice(randomIndex, 1)[0]);
            } else {
                // Fallback ke tier lain jika stok habis
                const fallbackTiers = ['d', 'c', 'b', 'a'].filter(t => t !== targetTier);
                let foundFallback = false;
                for (const fbTier of fallbackTiers) {
                    const fbConfig = await PlayerConfig.findOne({ tier: fbTier });
                    const fbImages = fbConfig ? fbConfig.images : [];
                    const fbAvailable = fbImages.filter(p => !excludeList.includes(p) && !selectedPlayers.includes(p));
                    if (fbAvailable.length > 0) {
                        const fbIndex = Math.floor(Math.random() * fbAvailable.length);
                        const fbPlayer = fbAvailable[fbIndex];
                        selectedPlayers.push(fbPlayer);
                        excludeList.push(fbPlayer);
                        foundFallback = true;
                        break;
                    }
                }
                if (!foundFallback) {
                    selectedPlayers.push(PLACEHOLDER_IMAGE);
                }
            }
        }
        return selectedPlayers;
    } catch (err) {
        console.error(`[getRandomPlayers] Error for tier ${targetTier}:`, err.message);
        return Array(count).fill(PLACEHOLDER_IMAGE);
    }
};

const selectTierBasedOnWeights = (weights) => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) {
        const tiers = Object.keys(weights);
        return tiers.length > 0 ? tiers[Math.floor(Math.random() * tiers.length)] : 'Nova';
    }
    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;
    for (const tier in weights) {
        weightSum += weights[tier];
        if (randomNum <= weightSum) return tier;
    }
    return Object.keys(weights)[0] || 'Nova';
};

// --- LOGIKA GENERATE DUMMY PRIZES BERDASARKAN PAKET ---
const generateDummyPrizes = async (packageAmount) => {
    const dummyPrizes = [];
    const selectedTiers = [];
    const usedPlayers = [];

    console.log(`[DUMMY GEN] Generating strict tiers for Package: Rp ${packageAmount}`);

    if (packageAmount >= 150000) {
        // --- PAKET 150.000: Radiant mendominasi, Nova & Pulse bersih total ---
        const radiantChance = Math.random();
        if (radiantChance < 0.2) {
            selectedTiers.push('Radiant', 'Radiant', 'Radiant'); // 3 Radiant (jarang)
        } else if (radiantChance < 0.75) {
            selectedTiers.push('Radiant', 'Radiant', 'Flux'); // 2 Radiant + 1 Flux (sangat tinggi)
        } else {
            selectedTiers.push('Radiant', 'Flux', 'Flux'); // 1 Radiant + 2 Flux
        }
    } else if (packageAmount >= 100000) {
        // --- PAKET 100.000: Radiant min 1, Flux pasti, Nova DIHILANGKAN (Bobot 0) ---
        const radiantTwoChance = Math.random();
        if (radiantTwoChance < 0.3) {
            selectedTiers.push('Radiant', 'Radiant', 'Flux'); 
        } else {
            // Hanya Radiant, Flux, atau Pulse (Nova 0%)
            const thirdTier = Math.random() < 0.6 ? 'Flux' : 'Pulse';
            selectedTiers.push('Radiant', 'Flux', thirdTier);
        }
    } else {
        // --- PAKET 50.000 (Standar): Nova sering, Pulse/Flux sedang, Radiant jarang ---
        const weights = { Nova: 48, Pulse: 36, Flux: 15, Radiant: 1 };
        
        const numCardsChoice = Math.random();
        const totalCards = numCardsChoice < 0.2 ? 1 : (numCardsChoice < 0.5 ? 2 : 3);

        for (let i = 0; i < totalCards; i++) {
            selectedTiers.push(selectTierBasedOnWeights(weights));
        }
    }

    // Acak urutan posisi kartu
    selectedTiers.sort(() => 0.5 - Math.random());
    console.log(`[DUMMY GEN] Final Tiers selected for Rp ${packageAmount}: ${selectedTiers.join(', ')}`);

    for (const selectedTier of selectedTiers) {
        let players = [];
        if (selectedTier === 'Nova') { 
            // Nova: Kombinasi acak dari Tier C dan Tier D
            const subTier1 = Math.random() < 0.5 ? 'c' : 'd';
            const subTier2 = Math.random() < 0.5 ? 'c' : 'd';
            const p1 = await getRandomPlayers(subTier1, 1, usedPlayers);
            usedPlayers.push(...p1.filter(p => p !== PLACEHOLDER_IMAGE));
            const p2 = await getRandomPlayers(subTier2, 1, usedPlayers);
            players = [...p1, ...p2];
        } else if (selectedTier === 'Pulse') { 
            // Pulse: 1 dari Tier B + 1 dari Tier C
            const playerB = await getRandomPlayers('b', 1, usedPlayers);
            usedPlayers.push(...playerB.filter(p => p !== PLACEHOLDER_IMAGE));
            const playerC = await getRandomPlayers('c', 1, usedPlayers);
            players = [...playerB, ...playerC];
        } else if (selectedTier === 'Flux') { 
            // Flux: 2 dari Tier B
            players = await getRandomPlayers('b', 2, usedPlayers);
        } else if (selectedTier === 'Radiant') { 
            // Radiant: 2 dari Tier A
            players = await getRandomPlayers('a', 2, usedPlayers);
        }
        
        usedPlayers.push(...players.filter(p => p !== PLACEHOLDER_IMAGE));
        players.sort(() => 0.5 - Math.random());
        dummyPrizes.push({ tier: selectedTier, players: players });
    }

    return dummyPrizes;
};

// --- CONTROLLER UTAMA GACHA ---
exports.claimGachaLink = async (req, res) => {
    const { token } = req.params;
    const { claim } = req.query;
    const timestamp = getTimestamp();

    console.log(`[${timestamp}] --- Gacha Request --- Token: ${token}, Claim: ${claim}`);

    try {
        const gachaLink = await GachaLink.findOne({ token }).populate('invoiceId');

        if (!gachaLink) {
            console.warn(`[${timestamp}] [WARN] Link invalid: ${token}`);
            return res.status(404).json({ msg: 'Gacha link tidak valid.' });
        }

        // Ambil nominal paket dari invoice terkait (default 50000)
        const packageAmount = gachaLink.invoiceId && gachaLink.invoiceId.grossAmount 
            ? Number(gachaLink.invoiceId.grossAmount) 
            : 50000;

        if (gachaLink.isUsed) {
            console.log(`[${timestamp}] [INFO] Link used: ${token}`);
            const savedDummies = gachaLink.dummyPrizes && gachaLink.dummyPrizes.length > 0
                ? gachaLink.dummyPrizes
                : await generateDummyPrizes(packageAmount);

            return res.status(200).json({
                status: 'used_account_deleted',
                msg: 'Link gacha ini sudah digunakan dan akun telah diambil.',
                account: null,
                accountId: null,
                dummyPrizes: savedDummies,
                packageAmount: packageAmount // Menyertakan nominal paket
            });
        }

        if (!gachaLink.invoiceId || !gachaLink.invoiceId.isPaid) {
            console.warn(`[${timestamp}] [WARN] Invoice not paid: ${token}`);
            return res.status(400).json({ msg: 'Pembayaran belum disetujui admin.' });
        }

        if (claim !== 'true') {
            console.log(`[${timestamp}] [INFO] Initial info request: ${token}`);
            return res.status(200).json({ 
                status: 'not_used',
                packageAmount: packageAmount // Menyertakan nominal paket untuk info awal
            });
        }

        console.log(`[${timestamp}] [PROCESS] Starting claim for package Rp ${packageAmount}: ${token}`);

        const availableAccounts = await Account.find({ status: 'available' });
        if (availableAccounts.length === 0) {
            console.error(`[${timestamp}] [ERROR] No available accounts for ${token}.`);
            return res.status(500).json({ msg: 'Stok akun kosong. Hubungi admin.' });
        }

        // Seleksi akun berdasarkan besaran paket
        let prizeAccount;
        if (packageAmount >= 150000) {
            const highTierAccounts = availableAccounts.filter(acc => acc.tier === 'Radiant' || acc.tier === 'Flux');
            prizeAccount = highTierAccounts.length > 0 
                ? highTierAccounts[Math.floor(Math.random() * highTierAccounts.length)]
                : availableAccounts[Math.floor(Math.random() * availableAccounts.length)];
        } else if (packageAmount >= 100000) {
            const midTierAccounts = availableAccounts.filter(acc => acc.tier === 'Flux' || acc.tier === 'Pulse' || acc.tier === 'Radiant');
            prizeAccount = midTierAccounts.length > 0 
                ? midTierAccounts[Math.floor(Math.random() * midTierAccounts.length)]
                : availableAccounts[Math.floor(Math.random() * availableAccounts.length)];
        } else {
            const randomIndex = Math.floor(Math.random() * availableAccounts.length);
            prizeAccount = availableAccounts[randomIndex];
        }

        console.log(`[${timestamp}] [PROCESS] Account selected: ${prizeAccount.email} (Tier: ${prizeAccount.tier})`);

        const prizeDetails = {
            email: prizeAccount.email,
            password: prizeAccount.password,
            tier: prizeAccount.tier,
            _id: prizeAccount._id.toString()
        };
        
        // Hapus akun dari database setelah diklaim
        await Account.deleteOne({ _id: prizeAccount._id });
        console.log(`[${timestamp}] [PROCESS] Account ${prizeAccount._id} permanently DELETED.`);

        // Generate 3 Hadiah Dummy secara dinamis berdasarkan paket
        const dummyPrizes = await generateDummyPrizes(packageAmount);

        gachaLink.isUsed = true;
        gachaLink.dummyPrizes = dummyPrizes;
        gachaLink.givenTo = null; 
        await gachaLink.save();
        console.log(`[${timestamp}] [SUCCESS] Link ${token} marked used, dummies saved.`);

        res.json({
            status: 'used',
            msg: `Selamat! Ini Akun Anda:`,
            account: { 
                email: prizeDetails.email,
                password: prizeDetails.password,
                tier: prizeDetails.tier,
            },
            accountId: prizeDetails._id,
            dummyPrizes: dummyPrizes,
            packageAmount: packageAmount
        });

    } catch (err) {
        console.error(`[${timestamp}] [FATAL] Error for token ${token}:`, err.message, err.stack);
        res.status(500).send('Server Error saat proses gacha.');
    }
};