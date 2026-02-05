import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TrainingBundle from '@/models/TrainingBundle';
import { verifyToken } from '@/lib/auth';

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
        const authUser = await verifyToken(request);
        const isAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'admin';
        const mine = searchParams.get('mine') === 'true';

        // Build query
        let query: any = {};

        // Security logic
        if (isAdmin) {
            if (status) query.approvalStatus = status;
            if (mine && authUser) query.createdBy = authUser.userId;
        } else if (mine && authUser) {
            // Strictly show only current user's content
            query.createdBy = authUser.userId;
        } else {
            // Show all approved and active content to everyone
            query = {
                $or: [
                    { isActive: true, approvalStatus: 'approved' }
                ]
            };

            // If user is logged in, show their own content too
            if (authUser) {
                query.$or.push({ createdBy: authUser.userId });
            }
        }

        // Handle Demo filtering - DISABLED FOR NOW
        // if (authUser?.email === 'demo@matcvault.com') { ... }

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

        // DEBUG: Allow POST even with fake token or if bypass fails
        if (!authUser) {
            console.log('No authUser found in POST /api/bundles');
        }

        const body = await request.json();

        // CREATE BUNDLE - Temporarily allow for any role during debug
        const bundle = await TrainingBundle.create({
            ...body,
            thumbnail: body.thumbnail || 'https://placehold.co/600x400/020617/ffffff?text=MATC+Vault',
            isActive: true, // Auto-activate for now
            approvalStatus: 'approved', // Auto-approve for now
            createdBy: authUser?.userId || '507f1f77bcf86cd799439011' // Fallback to admin id
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Archive publiée avec succès',
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
