import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
    userId: mongoose.Types.ObjectId;
    platformOpinion: string;
    suggestions: string;
    createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true // Ensure only one feedback per user
        },
        platformOpinion: {
            type: String,
            required: [true, 'Opinion is required'],
            trim: true
        },
        suggestions: {
            type: String,
            required: [true, 'Suggestions are required'],
            trim: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

const Feedback = (mongoose.models && mongoose.models.Feedback)
    ? (mongoose.models.Feedback as Model<IFeedback>)
    : mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
