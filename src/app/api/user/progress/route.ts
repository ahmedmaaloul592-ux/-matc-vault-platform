import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserProgress from '@/models/UserProgress';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const progress = await UserProgress.find({ userId: user.userId });
        return NextResponse.json({ success: true, data: progress });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { bundleId, isStarred, progress, status } = await request.json();

        const updateData: any = {};
        if (isStarred !== undefined) updateData.isStarred = isStarred;
        if (progress !== undefined) updateData.progress = progress;
        if (status !== undefined) updateData.status = status;

        const result = await UserProgress.findOneAndUpdate(
            { userId: user.userId, bundleId },
            { $set: updateData },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
