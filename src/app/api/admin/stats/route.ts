import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TrainingBundle from '@/models/TrainingBundle';
import License from '@/models/License';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/stats - Get global platform stats
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request, ['ADMIN']);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const [
            totalUsers,
            totalBundles,
            totalLicenses,
            activeLicenses,
            usersByRole
        ] = await Promise.all([
            User.countDocuments(),
            TrainingBundle.countDocuments(),
            License.countDocuments(),
            License.countDocuments({ status: 'USED' }),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ])
        ]);

        const roleBreakdown = usersByRole.reduce((acc: any, curr: any) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return NextResponse.json(
            {
                success: true,
                stats: {
                    users: {
                        total: totalUsers,
                        breakdown: roleBreakdown
                    },
                    content: {
                        bundles: totalBundles
                    },
                    sales: {
                        licenses: totalLicenses,
                        active: activeLicenses,
                        revenue: totalLicenses * 5 // Mock revenue calculation based on 5€ base price
                    }
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
