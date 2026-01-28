import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrainingBundle extends Document {
    title: string;
    provider: {
        name: string;
        logo?: string;
        type: 'Expert' | 'Institute' | 'Agency';
    };
    contentType: string;
    description: string;
    thumbnail: string;
    stats: {
        videoHours: number;
        documentCount: number;
        hasLiveSupport: boolean;
    };
    price: number;
    rating?: number;
    category: 'QHSE' | 'ISO' | 'Safety' | 'Quality' | 'Environment';
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TrainingBundleSchema = new Schema<ITrainingBundle>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        provider: {
            name: {
                type: String,
                required: true,
                trim: true
            },
            logo: String,
            type: {
                type: String,
                enum: ['Expert', 'Institute', 'Agency'],
                required: true
            }
        },
        contentType: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        },
        thumbnail: {
            type: String,
            required: true
        },
        stats: {
            videoHours: {
                type: Number,
                required: true,
                min: [0, 'Video hours cannot be negative']
            },
            documentCount: {
                type: Number,
                required: true,
                min: [0, 'Document count cannot be negative']
            },
            hasLiveSupport: {
                type: Boolean,
                default: false
            }
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        category: {
            type: String,
            enum: ['QHSE', 'ISO', 'Safety', 'Quality', 'Environment'],
            default: 'QHSE'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
TrainingBundleSchema.index({ title: 'text', description: 'text' });
TrainingBundleSchema.index({ category: 1, isActive: 1 });
TrainingBundleSchema.index({ createdBy: 1 });

const TrainingBundle: Model<ITrainingBundle> =
    mongoose.models.TrainingBundle || mongoose.model<ITrainingBundle>('TrainingBundle', TrainingBundleSchema);

export default TrainingBundle;
