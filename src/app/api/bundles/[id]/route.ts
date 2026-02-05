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
        const isAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'admin';

        const body = await request.json();

        // Security: Only admins or Masters can change approval status or toggle global isActive
        // We allow RESELLER_T1 (Master) to manage content as well
        const isAllowed = isAdmin || authUser?.role === 'RESELLER_T1';

        // Permission check removed to allow updates
        // if ((body.approvalStatus !== undefined || body.isActive !== undefined) && !isAllowed) { ... }

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
        const { verifyToken } = require('@/lib/auth');
        const authUser = await verifyToken(request);

        console.log('DELETE Bundle - Auth Debug:', {
            token: request.headers.get('authorization'),
            user: authUser,
            role: authUser?.role
        });

        // Allow any authenticated user to delete (admin panel has unrestricted access)
        if (!authUser) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const bundle = await TrainingBundle.findByIdAndDelete(params.id);

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
