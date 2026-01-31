
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';
import License from '@/models/License';

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const masterId = searchParams.get('masterId');

        if (!masterId) {
            return NextResponse.json({ message: 'Master ID is required' }, { status: 400 });
        }

        console.log(`[API] Fetching partners for masterId: ${masterId}`);

        // Robust query handling - Fetch both Partners (RESELLER_T2) and Learners (STUDENT)
        let query: any = { role: { $in: ['RESELLER_T2', 'STUDENT'] } };
        if (mongoose.Types.ObjectId.isValid(masterId)) {
            query.masterId = new mongoose.Types.ObjectId(masterId);
        } else {
            query.masterId = masterId;
        }

        const partners = await User.find(query).select('+plainPassword').sort({ role: 1, createdAt: -1 });

        console.log(`[API] Found ${partners.length} partners for query:`, query);

        // Add license stats for each partner
        const partnersWithStats = await Promise.all(partners.map(async (partner) => {
            const licenses = await License.find({ ownedBy: partner._id });
            return {
                ...partner.toObject(),
                licenseCount: licenses.length,
                activeLicenses: licenses.filter(l => l.status !== 'AVAILABLE').length
            };
        }));

        return NextResponse.json(partnersWithStats);

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
