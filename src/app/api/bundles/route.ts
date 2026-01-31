import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TrainingBundle from '@/models/TrainingBundle';

// GET /api/bundles - Get training bundles
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const { verifyToken } = require('@/lib/auth');
        const authUser = await verifyToken(request);
        const isAdmin = authUser?.role === 'ADMIN';

        // Build query
        const query: any = {};

        // Security logic
        if (isAdmin) {
            if (status) query.approvalStatus = status;
        } else {
            // Non-admins (Partners/Masters/Students)
            // Show either: 1. Approved & Active content OR 2. Content created by them
            query.$or = [
                { isActive: true, approvalStatus: 'approved' },
                { createdBy: authUser?.userId }
            ];
        }

        // Handle Demo filtering
        if (authUser?.email === 'demo@matcvault.com') {
            query.isDemo = true;
        } else if (!isAdmin) {
            // If student/partner, and looking at the store, only show non-demo?
            // Actually let's keep it simple: if not admin, hide demo unless explicitly requested (which we don't have yet)
            query.isDemo = { $ne: true };
        }

        if (category) query.category = category;
        if (search) query.$text = { $search: search };

        // Execute query
        const skip = (page - 1) * limit;
        const bundles = await TrainingBundle.find(query)
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await TrainingBundle.countDocuments(query);

        return NextResponse.json(
            {
                success: true,
                data: bundles,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get bundles error:', error);
        return NextResponse.json({ success: false, message: 'An error occurred', error: error.message }, { status: 500 });
    }
}

// POST /api/bundles - Create new training bundle
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { verifyToken } = require('@/lib/auth');
        const authUser = await verifyToken(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Business Logic: If user is not ADMIN, set as pending and inactive
        const isAdmin = authUser.role === 'ADMIN';
        const isPartnerOrMaster = authUser.role === 'RESELLER_T1' || authUser.role === 'RESELLER_T2' || authUser.role === 'PROVIDER';

        if (!isAdmin && !isPartnerOrMaster) {
            return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
        }

        const bundle = await TrainingBundle.create({
            ...body,
            isActive: isAdmin ? (body.isActive !== undefined ? body.isActive : true) : false,
            approvalStatus: isAdmin ? 'approved' : 'pending',
            createdBy: authUser.userId
        });

        return NextResponse.json(
            {
                success: true,
                message: isAdmin ? 'Archive publiée avec succès' : 'Archive soumise pour validation par l\'administration',
                data: bundle
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Create bundle error:', error);

        if (error.name === 'ValidationError') {
            console.error('Mongoose Validation Error details:', error.errors);
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: messages,
                    details: error.errors
                },
                { status: 400 }
            );
        }

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
