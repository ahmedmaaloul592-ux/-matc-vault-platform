import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TrainingBundle from '@/models/TrainingBundle';

// GET /api/debug/bundles - Debug endpoint to check all bundles
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const bundles = await TrainingBundle.find({})
            .select('title isActive approvalStatus isDemo resourceType category')
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                total: bundles.length,
                bundles: bundles.map(b => ({
                    id: b._id,
                    title: b.title,
                    isActive: b.isActive,
                    approvalStatus: b.approvalStatus,
                    isDemo: b.isDemo,
                    resourceType: b.resourceType,
                    category: b.category
                }))
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Debug bundles error:', error);
        return NextResponse.json(
            { success: false, message: 'Error', error: error.message },
            { status: 500 }
        );
    }
}
