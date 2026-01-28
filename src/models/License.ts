import mongoose, { Schema, Document, Model } from 'mongoose';

export type LicenseStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface ILicense extends Document {
    key: string;
    status: LicenseStatus;
    ownedBy: mongoose.Types.ObjectId; // Partner or Master who owns this license
    learner?: {
        userId: mongoose.Types.ObjectId;
        name: string;
        email: string;
        phone?: string;
    };
    activationDate?: Date;
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
            enum: ['AVAILABLE', 'USED', 'EXPIRED'],
            default: 'AVAILABLE'
        },
        ownedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        learner: {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            name: String,
            email: String,
            phone: String
        },
        activationDate: Date,
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
LicenseSchema.index({ key: 1 });
LicenseSchema.index({ ownedBy: 1, status: 1 });
LicenseSchema.index({ 'learner.userId': 1 });

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
