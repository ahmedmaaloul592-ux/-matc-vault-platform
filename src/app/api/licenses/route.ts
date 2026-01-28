import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import License from '@/models/License';
import { requireAuth } from '@/lib/auth';

// GET /api/licenses - Get user's licenses
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;

        // Get licenses owned by this user
        const licenses = await License.find({ ownedBy: user.userId })
            .sort({ createdAt: -1 });

        const stats = {
            total: licenses.length,
            available: licenses.filter(l => l.status === 'AVAILABLE').length,
            used: licenses.filter(l => l.status === 'USED').length,
            expired: licenses.filter(l => l.status === 'EXPIRED').length
        };

        return NextResponse.json(
            {
                success: true,
                data: licenses,
                stats
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Get licenses error:', error);
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

// POST /api/licenses - Create new licenses (Partner/Master only)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request, ['RESELLER_T1', 'RESELLER_T2']);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;
        const body = await request.json();
        const { quantity = 1, price = 5 } = body;

        // Create multiple licenses
        const licenses = [];
        for (let i = 0; i < quantity; i++) {
            const license = await License.create({
                ownedBy: user.userId,
                price,
                status: 'AVAILABLE'
            });
            licenses.push(license);
        }

        return NextResponse.json(
            {
                success: true,
                message: `${quantity} license(s) created successfully`,
                data: licenses
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Create licenses error:', error);
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
