
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
        const quantity = Number(data.quantity);

        for (let i = 0; i < quantity; i++) {
            licensesToCreate.push({
                ownedBy: data.ownedBy,
                price: data.price || 50, // Default price or from data
                maxUsers: 10, // Default 10 users per license
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
