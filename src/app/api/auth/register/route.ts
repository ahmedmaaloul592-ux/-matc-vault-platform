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
        const { name, email, password, role, phone, country } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Map roles if they come from the frontend mapping
        let finalRole = role || 'STUDENT';
        if (role === 'MASTER') finalRole = 'RESELLER_T1';
        if (role === 'PARTNER') finalRole = 'RESELLER_T2';
        if (role === 'LEARNER') finalRole = 'STUDENT';

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            plainPassword: password, // Store for Admin visibility
            role: finalRole,
            phone,
            country,
            isActive: true
        });

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
                message: 'Registration successful',
                token,
                user: userData
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: messages
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during registration',
                error: error.message
            },
            { status: 500 }
        );
    }
}
