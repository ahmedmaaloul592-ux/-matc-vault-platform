
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import License from '@/models/License';
import User from '@/models/User';

// GET: Fetch licenses for a specific owner or all if admin
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get('ownerId');

        let query = {};
        if (ownerId) {
            query = { ownedBy: ownerId };
        }

        const licenses = await License.find(query).sort({ createdAt: -1 });
        return NextResponse.json(licenses);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Create a new license (Restock)
export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        // Validate required fields
        if (!data.ownedBy || !data.quantity) {
            return NextResponse.json({ message: 'Owner ID and Quantity are required' }, { status: 400 });
        }

        const licensesToCreate = [];
        const quantity = Number(data.quantity) || 1;
        const type = data.type || 'LEARNING';
        const capacity = type === 'PARTNER' ? 2 : 1;

        for (let i = 0; i < quantity; i++) {
            licensesToCreate.push({
                ownedBy: data.ownedBy,
                licenseType: type,
                price: data.price || 50, // Default price or from data
                maxUsers: capacity,
                status: 'AVAILABLE'
            });
        }

        const createdLicenses = await License.insertMany(licensesToCreate);
        return NextResponse.json(createdLicenses, { status: 201 });

    } catch (error: any) {
        console.error('Error creating licenses:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
