const mongoose = require('mongoose');

const DummyPrizeSchema = new mongoose.Schema({
    tier: { type: String, required: true },
    players: { 
        type: [String],
        required: true,
        validate: [v => v.length === 2, 'Harus ada tepat 2 pemain dummy']
    }
}, { _id: false });


const GachaLinkSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    dummyPrizes: { 
        type: [DummyPrizeSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GachaLink', GachaLinkSchema);