import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'ADMIN' | 'PROVIDER' | 'RESELLER_T1' | 'RESELLER_T2' | 'STUDENT';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    walletBalance?: number;
    enrolledLearners?: number;
    plusPoints?: number;
    phone?: string;
    country?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Don't return password by default
        },
        role: {
            type: String,
            enum: ['ADMIN', 'PROVIDER', 'RESELLER_T1', 'RESELLER_T2', 'STUDENT'],
            default: 'STUDENT'
        },
        walletBalance: {
            type: Number,
            default: 0,
            min: [0, 'Wallet balance cannot be negative']
        },
        enrolledLearners: {
            type: Number,
            default: 0,
            min: [0, 'Enrolled learners cannot be negative']
        },
        plusPoints: {
            type: Number,
            default: 0,
            min: [0, 'Plus points cannot be negative']
        },
        phone: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
