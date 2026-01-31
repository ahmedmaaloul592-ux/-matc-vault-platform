
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LicenseRequest from '@/models/LicenseRequest';
import User from '@/models/User';

// GET: Fetch all requests (Admin only ideally, or filtered by user)
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');

        let query: any = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;

        const requests = await LicenseRequest.find(query).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Create a new request (Partner)
export async function POST(req: Request) {
    try {
        await connectDB();
        const { userId, quantity } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Check for existing pending request
        const existingRequest = await LicenseRequest.findOne({ userId, status: 'PENDING' });
        if (existingRequest) {
            return NextResponse.json({ message: 'Vous avez déjà une demande en attente.' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const newRequest = await LicenseRequest.create({
            userId,
            userName: user.name,
            userEmail: user.email,
            quantity: quantity || 5,
            status: 'PENDING'
        });

        return NextResponse.json({ message: 'Demande envoyée avec succès', request: newRequest }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating request:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
