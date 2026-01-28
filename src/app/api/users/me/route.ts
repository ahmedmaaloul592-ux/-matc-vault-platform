import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// GET /api/users/me - Get current user profile
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user: authUser } = authResult;

        const user = await User.findById(authUser.userId).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    walletBalance: user.walletBalance,
                    enrolledLearners: user.enrolledLearners,
                    plusPoints: user.plusPoints,
                    phone: user.phone,
                    country: user.country,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Get user error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
                error: error.message
            },
            { status: 500 }
        );
    }
}

// PATCH /api/users/me - Update current user profile
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user: authUser } = authResult;
        const body = await request.json();

        // Fields that can be updated
        const allowedUpdates = ['name', 'phone', 'country'];
        const updates: any = {};

        for (const key of allowedUpdates) {
            if (body[key] !== undefined) {
                updates[key] = body[key];
            }
        }

        const user = await User.findByIdAndUpdate(
            authUser.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    walletBalance: user.walletBalance,
                    enrolledLearners: user.enrolledLearners,
                    plusPoints: user.plusPoints,
                    phone: user.phone,
                    country: user.country
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Update user error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
                error: error.message
            },
            { status: 500 }
        );
    }
}
