import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectDB();

        // Verify partner/master authentication
        const user = await verifyToken(req as any);

        if (!user || (user.role !== 'RESELLER_T2' && user.role !== 'RESELLER_T1' && user.role !== 'ADMIN')) {
            return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
        }

        const { studentId } = await req.json();

        if (!studentId) {
            return NextResponse.json({ message: 'Student ID is required' }, { status: 400 });
        }

        // Find the student
        const student = await User.findById(studentId);

        if (!student) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        if (student.role !== 'STUDENT') {
            return NextResponse.json({ message: 'User is not a student' }, { status: 400 });
        }

        // Verify ownership (partner can only renew their own students)
        if (user.role !== 'ADMIN' && student.masterId?.toString() !== user.userId) {
            return NextResponse.json({ message: 'You can only renew your own students' }, { status: 403 });
        }

        // Extend expiry date by 90 days from current expiry or now (whichever is later)
        const baseDate = student.expiryDate && new Date(student.expiryDate) > new Date()
            ? new Date(student.expiryDate)
            : new Date();

        const newExpiryDate = new Date(baseDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + 90);

        student.expiryDate = newExpiryDate;
        student.isActive = true; // Reactivate if was deactivated
        await student.save();

        return NextResponse.json({
            success: true,
            message: 'Abonnement renouvelé avec succès pour 3 mois',
            newExpiryDate: newExpiryDate.toISOString(),
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                expiryDate: newExpiryDate
            }
        });

    } catch (error: any) {
        console.error('Renewal Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
