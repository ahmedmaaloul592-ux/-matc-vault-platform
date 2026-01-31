import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
    userId: mongoose.Types.ObjectId;
    bundleId: mongoose.Types.ObjectId;
    isStarred: boolean;
    progress: number; // 0 to 100
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        bundleId: {
            type: Schema.Types.ObjectId,
            ref: 'TrainingBundle',
            required: true
        },
        isStarred: {
            type: Boolean,
            default: false
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        status: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
            default: 'NOT_STARTED'
        }
    },
    {
        timestamps: true
    }
);

// Compound index for fast lookup
UserProgressSchema.index({ userId: 1, bundleId: 1 }, { unique: true });

const UserProgress = (mongoose.models && mongoose.models.UserProgress)
    ? (mongoose.models.UserProgress as Model<IUserProgress>)
    : mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export default UserProgress;
