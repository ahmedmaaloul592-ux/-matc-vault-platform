
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LicenseRequest from '@/models/LicenseRequest';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { requestId, reason } = await req.json();

        if (!requestId) {
            return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
        }

        const request = await LicenseRequest.findById(requestId);
        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'PENDING') {
            return NextResponse.json({ message: 'Request is already processed' }, { status: 400 });
        }

        request.status = 'REJECTED';
        // Optional: add reason if field exists, for now just status
        await request.save();

        return NextResponse.json({ message: 'Demande rejetée.' });

    } catch (error: any) {
        console.error('Error rejecting request:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
