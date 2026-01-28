import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import License from '@/models/License';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// POST /api/licenses/activate - Activate a license for a learner
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request, ['RESELLER_T1', 'RESELLER_T2']);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;
        const body = await request.json();
        const { licenseKey, learnerEmail, learnerName, learnerPhone } = body;

        // Validation
        if (!licenseKey || !learnerEmail || !learnerName) {
            return NextResponse.json(
                { success: false, message: 'License key, learner email, and name are required' },
                { status: 400 }
            );
        }

        // Find the license
        const license = await License.findOne({
            key: licenseKey.toUpperCase(),
            ownedBy: user.userId,
            status: 'AVAILABLE'
        });

        if (!license) {
            return NextResponse.json(
                { success: false, message: 'License not found or already used' },
                { status: 404 }
            );
        }

        // Check if learner already exists
        let learner = await User.findOne({ email: learnerEmail });

        // If learner doesn't exist, create them
        if (!learner) {
            learner = await User.create({
                name: learnerName,
                email: learnerEmail,
                password: Math.random().toString(36).substring(2, 10), // Random password
                role: 'STUDENT',
                phone: learnerPhone
            });
        }

        // Activate the license
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months validity

        license.status = 'USED';
        license.learner = {
            userId: learner._id,
            name: learnerName,
            email: learnerEmail,
            phone: learnerPhone
        };
        license.activationDate = new Date();
        license.expiryDate = expiryDate;

        await license.save();

        // Update reseller's enrolled learners count
        await User.findByIdAndUpdate(
            user.userId,
            { $inc: { enrolledLearners: 1 } }
        );

        return NextResponse.json(
            {
                success: true,
                message: 'License activated successfully',
                data: {
                    license,
                    learner: {
                        id: learner._id,
                        name: learner.name,
                        email: learner.email
                    }
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Activate license error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
                error: error.message
            },
            { status: 500 }
        );
    }
}
