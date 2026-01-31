
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import License from '@/models/License';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { licenseKey, name, email, phone } = await req.json();

        // 1. Find License
        const license = await License.findOne({ key: licenseKey });

        if (!license) {
            return NextResponse.json({ message: 'License key not found' }, { status: 404 });
        }

        // 2. Check Validity
        if (license.status === 'EXPIRED') {
            return NextResponse.json({ message: 'License has expired' }, { status: 400 });
        }

        if (license.usageCount >= license.maxUsers) {
            return NextResponse.json({ message: 'License usage limit reached' }, { status: 400 });
        }

        // 3. Create Learner Account
        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // If user exists, meaningful handling depends on logic. 
            // For now, we assume we link the existing user, or error out.
            // Let's assume we proceed to just link them for now.
            // linking logic...
        } else {
            // Create new user with License Key as Password
            // NOTE: Password will be hashed by User model hook
            // Set expiry date to 90 days (3 months) from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 90);

            user = await User.create({
                name,
                email,
                password: licenseKey, // KEY IS PASSWORD
                plainPassword: licenseKey, // Store plain key
                role: 'STUDENT',
                masterId: license.ownedBy, // Link student to the partner who owns the license
                isActive: true,
                phone,
                expiryDate
            });
        }

        // 4. Update License
        license.learners.push({
            userId: user._id as any,
            name: user.name,
            email: user.email,
            phone: user.phone,
            activationDate: new Date()
        });

        license.usageCount += 1;

        if (license.usageCount >= license.maxUsers) {
            license.status = 'USED';
        } else {
            license.status = 'PARTIALLY_USED';
        }

        await license.save();

        return NextResponse.json({
            success: true,
            message: 'User activated successfully',
            user: { name: user.name, email: user.email }
        });

    } catch (error: any) {
        console.error('Activation Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
