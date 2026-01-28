import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TrainingBundle from '@/models/TrainingBundle';

// GET /api/bundles/[id] - Get single bundle
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const bundle = await TrainingBundle.findById(params.id)
            .populate('createdBy', 'name email');

        if (!bundle) {
            return NextResponse.json(
                { success: false, message: 'Bundle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: bundle
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Get bundle error:', error);
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

// PATCH /api/bundles/[id] - Update bundle
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const body = await request.json();

        const bundle = await TrainingBundle.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!bundle) {
            return NextResponse.json(
                { success: false, message: 'Bundle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Bundle updated successfully',
                data: bundle
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Update bundle error:', error);
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

// DELETE /api/bundles/[id] - Delete bundle (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const bundle = await TrainingBundle.findByIdAndUpdate(
            params.id,
            { isActive: false },
            { new: true }
        );

        if (!bundle) {
            return NextResponse.json(
                { success: false, message: 'Bundle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Bundle deleted successfully'
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Delete bundle error:', error);
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
