import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResourceType = 'COURSE_SERIES' | 'VIDEO' | 'DOCUMENT' | 'TOOL' | 'EDUCATIONAL_PLATFORM';
export type DocumentFormat = 'PDF' | 'EXCEL' | 'WORD' | 'POWERPOINT' | 'SHEET';

export interface IBundleSession {
    title: string;
    videoUrl?: string;
    supportUrl?: string;
    duration?: string;
}

export interface ITrainingBundle extends Document {
    title: string;
    provider: {
        name: string;
        logo?: string;
        type: 'Expert' | 'Institute' | 'Agency';
    };
    resourceType: ResourceType;
    documentFormat?: DocumentFormat;
    contentType: string;
    description: string;
    thumbnail: string;
    stats: {
        videoHours: number;
        documentCount: number;
        sessionCount?: number;
        hasLiveSupport: boolean;
    };
    price: number;
    rating?: number;
    category: 'QHSE' | 'ISO' | 'Safety' | 'Quality' | 'Environment' | 'Archive';
    externalLink?: string;
    sessions?: IBundleSession[];
    isActive: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    isDemo: boolean;
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
            minlength: [2, 'Title must be at least 2 characters'],
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
        resourceType: {
            type: String,
            enum: ['COURSE_SERIES', 'VIDEO', 'DOCUMENT', 'TOOL', 'EDUCATIONAL_PLATFORM'],
            default: 'COURSE_SERIES',
            required: true
        },
        documentFormat: {
            type: String,
            enum: ['PDF', 'EXCEL', 'WORD', 'POWERPOINT', 'SHEET'],
            required: false
        },
        contentType: {
            type: String,
            required: true,
            trim: true,
            default: 'Technical Resource'
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [2, 'Description must be at least 2 characters'],
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
                min: [0, 'Video hours cannot be negative'],
                default: 0
            },
            documentCount: {
                type: Number,
                required: true,
                min: [0, 'Document count cannot be negative'],
                default: 0
            },
            sessionCount: {
                type: Number,
                min: [0, 'Session count cannot be negative'],
                default: 0
            },
            hasLiveSupport: {
                type: Boolean,
                default: false
            }
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
            default: 0
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
            default: 5
        },
        category: {
            type: String,
            enum: ['QHSE', 'ISO', 'Safety', 'Quality', 'Environment', 'Archive'],
            default: 'Archive'
        },
        externalLink: {
            type: String,
            trim: true
        },
        sessions: [
            {
                title: { type: String, required: true },
                videoUrl: String,
                supportUrl: String,
                duration: String
            }
        ],
        isActive: {
            type: Boolean,
            default: false
        },
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved' // Will be overridden in API for non-admins
        },
        isDemo: {
            type: Boolean,
            default: false
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
