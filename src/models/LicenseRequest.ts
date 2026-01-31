
import mongoose, { Schema, Document, Model } from 'mongoose';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ILicenseRequest extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    quantity: number;
    status: RequestStatus;
    createdAt: Date;
    updatedAt: Date;
}

const LicenseRequestSchema = new Schema<ILicenseRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: String,
        userEmail: String,
        quantity: {
            type: Number,
            default: 5
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        }
    },
    {
        timestamps: true
    }
);

const LicenseRequest: Model<ILicenseRequest> =
    mongoose.models.LicenseRequest || mongoose.model<ILicenseRequest>('LicenseRequest', LicenseRequestSchema);

export default LicenseRequest;
