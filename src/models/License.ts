import mongoose, { Schema, Document, Model } from 'mongoose';

export type LicenseStatus = 'AVAILABLE' | 'USED' | 'PARTIALLY_USED' | 'EXPIRED';

export interface ILicense extends Document {
    key: string;
    status: LicenseStatus;
    ownedBy: mongoose.Types.ObjectId; // Partner or Master who owns this license
    maxUsers: number;
    usageCount: number;
    learners: Array<{
        userId: mongoose.Types.ObjectId;
        name: string;
        email: string;
        phone?: string;
        activationDate: Date;
    }>;
    expiryDate?: Date;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

const LicenseSchema = new Schema<ILicense>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['AVAILABLE', 'USED', 'PARTIALLY_USED', 'EXPIRED'],
            default: 'AVAILABLE'
        },
        ownedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        maxUsers: {
            type: Number,
            default: 10,
            required: true
        },
        usageCount: {
            type: Number,
            default: 0,
            required: true
        },
        learners: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            name: String,
            email: String,
            phone: String,
            activationDate: {
                type: Date,
                default: Date.now
            }
        }],
        expiryDate: Date,
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        }
    },
    {
        timestamps: true
    }
);

// Indexes
LicenseSchema.index({ ownedBy: 1, status: 1 });
LicenseSchema.index({ 'learners.userId': 1 }); // Fixed path name from learner to learners

// Auto-generate license key before saving
LicenseSchema.pre('save', async function () {
    if (!this.key) {
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.key = `MATC-${year}-${random}`;
    }
});

const License: Model<ILicense> =
    mongoose.models.License || mongoose.model<ILicense>('License', LicenseSchema);

export default License;
