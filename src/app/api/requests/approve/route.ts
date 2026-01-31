
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LicenseRequest from '@/models/LicenseRequest';
import License from '@/models/License';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { requestId } = await req.json();

        const request = await LicenseRequest.findById(requestId);
        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'PENDING') {
            return NextResponse.json({ message: 'Request is handled already' }, { status: 400 });
        }

        // 1. Generate Licenses
        const licensesToCreate = [];
        const quantity = request.quantity || 5;

        for (let i = 0; i < quantity; i++) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const year = new Date().getFullYear();

            licensesToCreate.push({
                key: `MATC-${year}-WELCOME-${randomPart}-${i + 1}`,
                ownedBy: request.userId,
                status: 'AVAILABLE',
                maxUsers: 10,
                usageCount: 0,
                price: 0,
                learners: []
            });
        }

        await License.insertMany(licensesToCreate);

        // 2. Update Request Status
        request.status = 'APPROVED';
        await request.save();

        return NextResponse.json({ message: 'Demande approuvée et licences générées !' });

    } catch (error: any) {
        console.error('Error approving request:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
