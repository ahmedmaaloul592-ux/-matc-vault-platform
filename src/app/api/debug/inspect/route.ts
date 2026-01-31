import connectDB from '@/lib/db';
import User from '@/models/User';
import TrainingBundle from '@/models/TrainingBundle';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).select('email name role isActive');
        const bundles = await TrainingBundle.find({}).select('title isDemo isActive');

        return NextResponse.json({
            users,
            bundles
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}
