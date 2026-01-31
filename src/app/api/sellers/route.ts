import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await connectDB();

        // Fetch all sellers (RESELLER_T1 and RESELLER_T2) who are active
        const sellers = await User.find({
            role: { $in: ['RESELLER_T1', 'RESELLER_T2'] },
            isActive: true
        })
            .select('name country role bio paymentMethods phone')
            .sort({ role: 1, createdAt: -1 });

        // Map roles to match the frontend expectations
        const mappedSellers = sellers.map(s => ({
            id: s._id,
            name: s.name,
            country: s.country || 'International',
            countryCode: (s.country || 'UN').substring(0, 2).toUpperCase(),
            bio: s.bio || (s.role === 'RESELLER_T1' ? 'Distributeur Certifié MATC Master' : 'Partenaire Certifié MATC Local'),
            whatsapp: s.phone || '+21620388542',
            paymentMethods: s.paymentMethods ? s.paymentMethods.split(',').map((p: string) => p.trim()) : ['Contact Direct'],
            role: s.role === 'RESELLER_T1' ? 'MASTER' : 'PARTNER'
        }));

        return NextResponse.json(mappedSellers);
    } catch (error: any) {
        console.error('Error fetching sellers:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
