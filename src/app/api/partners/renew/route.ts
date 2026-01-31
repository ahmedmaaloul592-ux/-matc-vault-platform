import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectDB();

        // Verify Master/Admin authentication
        const user = await verifyToken(req as any);

        if (!user || (user.role !== 'RESELLER_T1' && user.role !== 'ADMIN')) {
            return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
        }

        const { partnerId } = await req.json();

        if (!partnerId) {
            return NextResponse.json({ message: 'Partner ID is required' }, { status: 400 });
        }

        // Find the partner
        const partner = await User.findById(partnerId);

        if (!partner) {
            return NextResponse.json({ message: 'Partner not found' }, { status: 404 });
        }

        if (partner.role !== 'RESELLER_T2') {
            return NextResponse.json({ message: 'User is not a partner' }, { status: 400 });
        }

        // Verify ownership (master can only renew their own partners)
        if (user.role !== 'ADMIN' && partner.masterId?.toString() !== user.userId) {
            return NextResponse.json({ message: 'You can only renew your own partners' }, { status: 403 });
        }

        // Extend expiry date by 365 days from current expiry or now (whichever is later)
        const baseDate = partner.expiryDate && new Date(partner.expiryDate) > new Date()
            ? new Date(partner.expiryDate)
            : new Date();

        const newExpiryDate = new Date(baseDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + 365);

        partner.expiryDate = newExpiryDate;
        partner.isActive = true; // Reactivate if was deactivated
        await partner.save();

        return NextResponse.json({
            success: true,
            message: 'Abonnement Partner renouvelé avec succès pour 1 an (100€)',
            newExpiryDate: newExpiryDate.toISOString(),
            partner: {
                id: partner._id,
                name: partner.name,
                email: partner.email,
                expiryDate: newExpiryDate
            }
        });

    } catch (error: any) {
        console.error('Partner Renewal Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
