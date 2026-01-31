
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    relatedLicense?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['CREDIT', 'DEBIT'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['COMPLETED', 'PENDING', 'FAILED'],
            default: 'COMPLETED'
        },
        relatedLicense: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction: Model<ITransaction> =
    mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
