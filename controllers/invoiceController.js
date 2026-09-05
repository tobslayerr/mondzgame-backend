// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const GachaLink = require('../models/GachaLink');
// --- PERUBAHAN DI SINI ---
// gachaUtils yang lama dihapus
const { generateGachaToken } = require('../utils/gachaUtils');
// --- AKHIR PERUBAHAN ---
const Account = require('../models/Account');

const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('en-GB', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ... (createUserInvoice, deletePendingInvoice, viewInvoices tetap sama) ...
exports.createUserInvoice = async (req, res) => {
    const { grossAmount, customerEmail } = req.body;
    if (!grossAmount || grossAmount <= 0 || !customerEmail) {
        return res.status(400).json({ msg: 'Harap berikan email dan jumlah yang valid.' });
    }
    try {
        const orderId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newInvoice = new Invoice({
            orderId: orderId,
            grossAmount: grossAmount,
            customerEmail: customerEmail,
        });
        await newInvoice.save();
        res.status(201).json({
            msg: 'Invoice berhasil dibuat. Harap lanjutkan pembayaran manual.',
            invoice: {
                _id: newInvoice._id,
                orderId: newInvoice.orderId,
                grossAmount: newInvoice.grossAmount,
                customerEmail: newInvoice.customerEmail
            }
        });
    } catch (err) {
        console.error(`[${getTimestamp()}] [INV_CTRL ERROR] Error creating user invoice:`, err.message);
        res.status(500).send('Server Error', err.message);
    }
};

exports.deletePendingInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            console.warn(`[${getTimestamp()}] [INV_CTRL WARN] Delete request for non-existent invoice ID: ${invoiceId}.`);
            return res.status(404).json({ msg: 'Invoice tidak ditemukan.' });
        }

        if (invoice.isPaid) {
            console.warn(`[${getTimestamp()}] [INV_CTRL WARN] Attempt to delete an already PAID invoice ID: ${invoiceId}.`);
            return res.status(400).json({ msg: 'Invoice yang sudah lunas tidak dapat dihapus.' });
        }
        
        if (invoice.gachaLink) {
             console.log(`[${getTimestamp()}] [INV_CTRL INFO] Deleting associated GachaLink ID: ${invoice.gachaLink} for invoice ${invoiceId}.`);
             await GachaLink.deleteOne({ _id: invoice.gachaLink });
        }

        await Invoice.deleteOne({ _id: invoiceId });

        console.log(`[${getTimestamp()}] [INV_CTRL SUCCESS] Pending invoice deleted successfully: ${invoiceId}`);
        res.status(200).json({ msg: 'Invoice berhasil dihapus.' });

    } catch (err) {
        console.error(`[${getTimestamp()}] [INV_CTRL FATAL ERROR] Error deleting pending invoice ID ${req.params.id}:`, err.message);
        res.status(500).json({ msg: 'Server Error saat menghapus invoice.', details: err.message });
    }
};

exports.viewInvoices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const { startDate, endDate, isPaid, linkStatus } = req.query;

        const matchStage = {};
        if (isPaid !== undefined) {
            matchStage.isPaid = isPaid === 'true';
        }
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
            if (endDate) matchStage.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        const pipeline = [
            { $match: matchStage }, 
            {
                $lookup: {
                    from: 'gachalinks', 
                    localField: 'gachaLink',
                    foreignField: '_id',
                    as: 'gachaLinkData'
                }
            },
            {
                $unwind: {
                    path: '$gachaLinkData',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $addFields: {
                    gachaLink: "$gachaLinkData"
                }
            }
        ];

        if (isPaid === 'true' && linkStatus) {
            if (linkStatus === 'used') {
                pipeline.push({ $match: { 'gachaLink.isUsed': true } });
            } else if (linkStatus === 'not_used') {
                pipeline.push({ $match: { 'gachaLink.isUsed': { $in: [false, null] } } });
            }
        }

        const countPipeline = [...pipeline, { $count: 'totalItems' }];
        const countResult = await Invoice.aggregate(countPipeline);
        const totalItems = countResult.length > 0 ? countResult[0].totalItems : 0;
        const totalPages = Math.ceil(totalItems / limit);

        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });
        pipeline.push({ $project: { gachaLinkData: 0 } }); 

        const invoices = await Invoice.aggregate(pipeline);

        console.log(`[${getTimestamp()}] [INV_CTRL INFO] Fetched ${invoices.length} invoices (Page: ${page}, Total: ${totalItems}, isPaid: ${isPaid}, linkStatus: ${linkStatus}).`);
        
        res.json({
            invoices,
            totalPages,
            currentPage: page,
            totalItems
        });

    } catch (err) {
        console.error(`[${getTimestamp()}] [INV_CTRL ERROR] Error viewing invoices (aggregation):`, err.message);
        res.status(500).send('Server Error', err.message);
    }
};

exports.approveAndGenerateGachaLink = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice tidak ditemukan.' });
        }
        if (invoice.isPaid) {
            return res.status(400).json({ msg: 'Invoice sudah ditandai lunas.' });
        }
        if (invoice.gachaLink) {
            return res.status(400).json({ msg: 'Link gacha sudah ada untuk invoice ini. Tidak dapat membuat lagi.' });
        }
        
        // --- PERUBAHAN DI SINI ---
        const gachaToken = generateGachaToken();
        const newGachaLink = new GachaLink({
            token: gachaToken,
            invoiceId: invoice._id,
            // numberOptions dan colorOptions dihapus
        });
        // --- AKHIR PERUBAHAN ---

        await newGachaLink.save();
        invoice.isPaid = true;
        invoice.gachaLink = newGachaLink._id;
        await invoice.save();
        res.status(200).json({
            msg: 'Invoice disetujui dan Link Gacha berhasil dibuat',
            gachaLink: {
                token: newGachaLink.token,
            }
        });
    } catch (err) {
        console.error(`[${getTimestamp()}] [INV_CTRL FATAL ERROR] Error approving invoice and gacha link for ID ${req.params.id}:`, err.message);
        res.status(500).json({ msg: 'Server Error', details: err.message });
    }
};

exports.getInvoiceDetails = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice tidak ditemukan' });
        }
        res.json(invoice);
    } catch (err) {
        console.error(`[${getTimestamp()}] [INV_CTRL ERROR] Error getting invoice details for ID ${req.params.id}:`, err.message);
        res.status(500).send('Server Error', err.message);
    }
};

exports.getInvoiceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; 

        const filterQuery = {
            isPaid: true
        };

        if (startDate || endDate) {
            filterQuery.createdAt = {};
            if (startDate) {
                let start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filterQuery.createdAt.$gte = start;
                console.log(`[${getTimestamp()}] Report - Start Date Applied:`, start); 
            }
            if (endDate) {
                let end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filterQuery.createdAt.$lte = end;
                console.log(`[${getTimestamp()}] Report - End Date Applied:`, end); 
            }
        } else {
             console.log(`[${getTimestamp()}] Report - No Date Filter Applied.`); 
        }

        console.log(`[${getTimestamp()}] [INV_CTRL INFO] Generating report with filter:`, JSON.stringify(filterQuery));

        const reportData = await Invoice.aggregate([
            { $match: filterQuery }, 
            {
                $lookup: { 
                    from: 'gachalinks',
                    localField: 'gachaLink',
                    foreignField: '_id',
                    as: 'gachaLinkData'
                }
            },
            { $unwind: '$gachaLinkData' }, 
            { $match: { 'gachaLinkData.isUsed': true } }, 
            { $sort: { createdAt: -1 } },
            {
                $group: { 
                    _id: null,
                    invoices: { $push: '$$ROOT' }, 
                    totalAmount: { $sum: "$grossAmount" }
                }
            },
            { 
                $project: {
                    _id: 0,
                     invoices: {
                        $map: {
                           input: "$invoices",
                           as: "inv",
                           in: {
                             _id: "$$inv._id",
                             orderId: "$$inv.orderId",
                             customerEmail: "$$inv.customerEmail",
                             createdAt: "$$inv.createdAt",
                             grossAmount: "$$inv.grossAmount",
                             gachaLink: "$$inv.gachaLinkData"
                           }
                        }
                     },
                    totalAmount: 1
                }
            }
        ]);

        if (reportData.length === 0) {
            return res.json({ invoices: [], totalAmount: 0 });
        }
        res.json(reportData[0]);

    } catch (err) {
        console.error(`[${getTimestamp()}] [INV_CTRL FATAL ERROR] Error generating invoice report:`, err.message, err.stack); 
        res.status(500).json({ msg: 'Server Error saat membuat laporan.', details: err.message });
    }
};