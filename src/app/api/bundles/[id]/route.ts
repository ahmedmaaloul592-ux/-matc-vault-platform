import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TrainingBundle from '@/models/TrainingBundle';

// GET /api/bundles/[id] - Get single bundle
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
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
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        await connectDB();
        const { verifyToken } = require('@/lib/auth');
        const authUser = await verifyToken(request);
        const isAdmin = authUser?.role === 'ADMIN';

        const body = await request.json();

        // Security: Only admins can change approval status or toggle global isActive
        if ((body.approvalStatus !== undefined || body.isActive !== undefined) && !isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Seul un administrateur peut modifier le statut d\'approbation' },
                { status: 403 }
            );
        }

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
                message: 'Bundle mis à jour avec succès',
                data: bundle
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Update bundle error:', error);
        return NextResponse.json({ success: false, message: 'An error occurred', error: error.message }, { status: 500 });
    }
}

// DELETE /api/bundles/[id] - Delete bundle (soft delete)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
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
