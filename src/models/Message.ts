import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    senderRole: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    channel: {
        type: String,
        enum: ['GLOBAL', 'ADMIN', 'PARTNER'],
        default: 'GLOBAL',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 172800 // 48h TTL
    }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;
