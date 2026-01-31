import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// GET /api/users/me - Get current user profile
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) return authResult;

        const { user: authUser } = authResult;

        // More flexible ID validation
        if (!authUser?.userId || typeof authUser.userId !== 'string') {
            return NextResponse.json({ success: false, message: 'Invalid User ID' }, { status: 400 });
        }

        // Use a lean query and handle population manually or with a string ref
        let user: any;
        try {
            user = await User.findById(authUser.userId)
                .select('-password')
                .populate({
                    path: 'masterId',
                    select: 'name country paymentMethods',
                    options: { strictPopulate: false }
                });
        } catch (dbError: any) {
            console.error('Database query error in /api/users/me:', dbError);
            return NextResponse.json({ success: false, message: 'User retrieval failed', error: dbError.message }, { status: 404 });
        }

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const userObj = user.toObject ? user.toObject() : user;

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: userObj._id,
                    name: userObj.name,
                    email: userObj.email,
                    role: userObj.role,
                    walletBalance: userObj.walletBalance,
                    enrolledLearners: userObj.enrolledLearners,
                    plusPoints: userObj.plusPoints,
                    phone: userObj.phone,
                    country: userObj.country,
                    isDemo: userObj.isDemo,
                    paymentMethods: userObj.paymentMethods,
                    bio: userObj.bio,
                    managedBy: userObj.masterId,
                    isActive: userObj.isActive,
                    createdAt: userObj.createdAt
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('SERVER CRASH /api/users/me GET:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal Server Error',
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

        // Validation of ID
        if (!authUser.userId || authUser.userId.length !== 24) {
            return NextResponse.json({ success: false, message: 'Invalid User ID format' }, { status: 400 });
        }

        // Fields that can be updated
        const allowedUpdates = ['name', 'phone', 'country', 'paymentMethods', 'bio'];
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
                    country: user.country,
                    isDemo: user.isDemo,
                    paymentMethods: user.paymentMethods,
                    bio: user.bio
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
