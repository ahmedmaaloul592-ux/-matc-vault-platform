
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import License from '@/models/License';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, phone, country, paymentMethods, masterId, licenseKey } = await req.json();

        if (!name || !email || !masterId || !licenseKey) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // 1. Verify License belongs to Master and is AVAILABLE
        const license = await License.findOne({ key: licenseKey, ownedBy: masterId, status: 'AVAILABLE' });
        if (!license) {
            return NextResponse.json({ message: 'License key invalid or not available in your stock' }, { status: 404 });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
        }

        // 3. Create Partner Account with licenseKey as password
        // Set expiry date to 365 days (1 year) from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 365);

        const newPartner = await User.create({
            name,
            email,
            phone,
            country,
            paymentMethods,
            password: licenseKey, // Fixed: license key is the password
            plainPassword: licenseKey, // Store plain key
            role: 'RESELLER_T2',
            masterId,
            isActive: true,
            expiryDate
        });

        console.log(`[API] Created new partner: ${newPartner.email} for master: ${masterId}`);

        // 4. Mark license as USED (since it's now the partner's account key)
        license.status = 'USED';
        await license.save();

        // 5. Generate 5 Welcome Licenses for the new Partner
        const welcomeLicenses = [];
        for (let i = 0; i < 5; i++) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            welcomeLicenses.push({
                key: `MATC-P-${randomPart}-${i}`, // Unique key
                ownedBy: newPartner._id,
                status: 'AVAILABLE',
                maxUsers: 10,
                usageCount: 0,
                price: 0,
                learners: []
            });
        }
        await License.insertMany(welcomeLicenses);

        return NextResponse.json({
            success: true,
            message: 'Partenaire ajouté avec succès !',
            partner: { name: newPartner.name, email: newPartner.email }
        });

    } catch (error: any) {
        console.error('Error adding partner:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
