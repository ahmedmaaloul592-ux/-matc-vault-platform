import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TrainingBundle from '@/models/TrainingBundle';

// GET /api/bundles - Get all training bundles
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build query
        const query: any = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const bundles = await TrainingBundle.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await TrainingBundle.countDocuments(query);

        return NextResponse.json(
            {
                success: true,
                data: bundles,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Get bundles error:', error);
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

// POST /api/bundles - Create new training bundle (Provider/Admin only)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Note: In production, add authentication middleware here
        const body = await request.json();

        const bundle = await TrainingBundle.create({
            ...body,
            createdBy: body.createdBy || '000000000000000000000000' // Temporary
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Training bundle created successfully',
                data: bundle
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Create bundle error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: messages
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
