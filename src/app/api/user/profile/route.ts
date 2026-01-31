
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: Request) {
    try {
        await connectDB();
        const { userId, name, phone, bio, country, paymentMethods } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (country) user.country = country;
        if (paymentMethods) user.paymentMethods = paymentMethods;

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Profil mis à jour avec succès !',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                bio: user.bio,
                country: user.country,
                paymentMethods: user.paymentMethods
            }
        });

    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
