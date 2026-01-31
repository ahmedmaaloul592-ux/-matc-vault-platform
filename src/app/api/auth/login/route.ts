import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { success: false, message: 'Account is deactivated' },
                { status: 403 }
            );
        }

        // Check subscription expiry for all roles (except ADMIN and PROVIDER)
        if (user.expiryDate && (user.role === 'STUDENT' || user.role === 'RESELLER_T2' || user.role === 'RESELLER_T1')) {
            const now = new Date();
            if (now > user.expiryDate) {
                let message = '';
                if (user.role === 'STUDENT') {
                    message = 'Votre abonnement de 3 mois a expiré. Veuillez contacter votre partenaire pour renouveler.';
                } else if (user.role === 'RESELLER_T2') {
                    message = 'Votre abonnement annuel Partner a expiré. Veuillez contacter votre Master pour renouveler.';
                } else if (user.role === 'RESELLER_T1') {
                    message = 'Votre abonnement annuel Master a expiré. Veuillez contacter l\'administration pour renouveler.';
                }

                return NextResponse.json(
                    {
                        success: false,
                        message,
                        expired: true,
                        role: user.role
                    },
                    { status: 403 }
                );
            }
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN as any }
        );

        // Return user data (without password)
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            walletBalance: user.walletBalance,
            enrolledLearners: user.enrolledLearners,
            plusPoints: user.plusPoints,
            phone: user.phone,
            country: user.country
        };

        return NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                token,
                user: userData
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login',
                error: error.message
            },
            { status: 500 }
        );
    }
}
