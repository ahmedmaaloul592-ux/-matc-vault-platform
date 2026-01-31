
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// GET: Fetch all users
export async function GET() {
    try {
        await connectDB();
        // Return passwords explicitly if needed for admin display, otherwise remove select('+password')
        // The user specifically asked to see passwords. BUT bcrypt hashes them.
        // We cannot show plain text passwords if we use the existing model logic which hashes them on save.
        // For now, let's fetch users. We'll deal with the password visibility dilemma separately.
        // Usually, we can't show hashed passwords back as plain text.
        // If the user insists on seeing passwords, we might need a workaround or accept that only NEWLY created users (in this session) show passwords,
        // OR we store a temp plain text version (Highly insecure, not recommended).
        // Let's stick to standard practice: You can't see the password once saved.
        // But wait, the user previously specifically asked to display passwords in the table.
        // If we move to MongoDB, we lose that ability unless we store it plainly or encrypted reversibly.
        // Given the instructions, I will proceed with standard secure practice but maybe return a placeholder or the hash.

        const users = await User.find({}).select('+plainPassword').sort({ createdAt: -1 });

        // Explicitly map to ensure plainPassword is included in the JSON response
        const mappedUsers = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            phone: u.phone,
            country: u.country,
            paymentMethods: u.paymentMethods,
            plainPassword: u.plainPassword,
            isDemo: u.isDemo,
            createdAt: u.createdAt
        }));

        return NextResponse.json(mappedUsers);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Create a new user
export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        // data.role comes as 'Master'/'Partner'/'Learner' from frontend usually
        // We need to map it to 'RESELLER_T1'/'RESELLER_T2'/'STUDENT' if not already done.
        // Or ensure frontend sends correct enum values.

        // Let's map it here to be safe if frontend sends display names
        let role = data.role;
        if (role === 'Master') role = 'RESELLER_T1';
        if (role === 'Partner') role = 'RESELLER_T2';
        if (role === 'Learner') role = 'STUDENT';

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
        }

        const newUser = await User.create({
            name: data.name,
            email: data.email,
            password: data.password, // This will be hashed by pre-save hook
            plainPassword: data.password, // Store for Admin visibility
            role: role,
            phone: data.phone,
            country: data.country,
            paymentMethods: data.paymentMethods,
            isActive: true,
            isDemo: data.isDemo || false
        });

        // Generate 5 Welcome Licenses automatically for Resellers (Master & Partner)
        if (role === 'RESELLER_T1' || role === 'RESELLER_T2') {
            const welcomeLicenses = [];
            for (let i = 0; i < 5; i++) {
                const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
                const year = new Date().getFullYear();

                welcomeLicenses.push({
                    key: `MATC-${year}-W-${randomPart}-${i}`,
                    ownedBy: newUser._id,
                    status: 'AVAILABLE',
                    maxUsers: 10,
                    usageCount: 0,
                    price: 0,
                    learners: []
                });
            }

            const License = require('@/models/License').default;
            await License.insertMany(welcomeLicenses);
        }

        // We return the created user. 
        // NOTE: The 'password' field in the returned document will be the HASHED one if we don't exclude it, 
        // or undefined if select: false is set in schema.

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH: Update a user
export async function PATCH(req: Request) {
    try {
        await connectDB();
        const data = await req.json();
        const { id, ...updates } = data;

        if (!id) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // If password is being updated, handle plainPassword and re-hashing
        if (updates.password) {
            updates.plainPassword = updates.password;
            // The password will be hashed by the User model's pre-save middleware
            // But finByIdAndUpdate doesn't trigger pre-save hooks usually unless we use save()
            const user = await User.findById(id);
            if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

            user.name = updates.name || user.name;
            user.email = updates.email || user.email;
            user.password = updates.password;
            user.plainPassword = updates.password;
            user.phone = updates.phone || user.phone;
            user.country = updates.country || user.country;
            user.paymentMethods = updates.paymentMethods || user.paymentMethods;
            user.role = updates.role || user.role;
            if (updates.isDemo !== undefined) user.isDemo = updates.isDemo;

            await user.save();
            return NextResponse.json(user);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE: Delete a user
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        await User.findByIdAndDelete(id);
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
