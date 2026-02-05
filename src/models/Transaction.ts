import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['LICENSE_SALE', 'ROYALTY_PAYOUT', 'COMMISSION'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
