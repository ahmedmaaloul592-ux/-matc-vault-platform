import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get all users
        const users = await User.find({}).select('name email role isActive createdAt');

        const userList = users.map(u => ({
            name: u.name,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt
        }));

        return NextResponse.json({
            success: true,
            count: users.length,
            users: userList
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const testUsers = [
            {
                name: 'Admin MATC',
                email: 'admin@matc.com',
                password: 'admin123',
                role: 'ADMIN',
                phone: '+21612345678',
                country: 'Tunisia',
                isActive: true
            },
            {
                name: 'Salome Makoueta',
                email: 'makouetasalome@gmail.com',
                password: 'salome2026',
                role: 'RESELLER_T1',
                phone: '+21698765432',
                country: 'Tunisia',
                isActive: true,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Lando M Joel',
                email: 'lando@matc.com',
                password: 'lando2026',
                role: 'RESELLER_T2',
                phone: '+21655555555',
                country: 'Tunisia',
                isActive: true,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Student Test',
                email: 'student@test.com',
                password: 'student123',
                role: 'STUDENT',
                phone: '+21644444444',
                country: 'Tunisia',
                isActive: true,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }
        ];

        const results = [];

        for (const userData of testUsers) {
            try {
                const existingUser = await User.findOne({ email: userData.email });

                if (existingUser) {
                    // Update password
                    existingUser.password = userData.password;
                    existingUser.plainPassword = userData.password;
                    existingUser.isActive = true;
                    await existingUser.save();

                    results.push({
                        email: userData.email,
                        status: 'updated',
                        password: userData.password
                    });
                } else {
                    // Create new user
                    const newUser = new User({
                        ...userData,
                        plainPassword: userData.password
                    });

                    await newUser.save();

                    results.push({
                        email: userData.email,
                        status: 'created',
                        password: userData.password
                    });
                }
            } catch (err: any) {
                results.push({
                    email: userData.email,
                    status: 'error',
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Test users seeded successfully',
            results,
            credentials: {
                admin: { email: 'admin@matc.com', password: 'admin123' },
                master: { email: 'makouetasalome@gmail.com', password: 'salome2026' },
                partner: { email: 'lando@matc.com', password: 'lando2026' },
                student: { email: 'student@test.com', password: 'student123' },
                demo: { email: 'demo@matcvault.com', password: 'demo2026' }
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
