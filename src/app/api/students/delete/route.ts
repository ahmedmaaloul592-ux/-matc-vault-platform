import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import License from '@/models/License';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: Request) {
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

        // Verify ownership (partner can only delete their own students)
        if (user.role !== 'ADMIN' && student.masterId?.toString() !== user.userId) {
            return NextResponse.json({ message: 'You can only delete your own students' }, { status: 403 });
        }

        // Remove student from all licenses
        await License.updateMany(
            { 'learners.userId': studentId },
            {
                $pull: { learners: { userId: studentId } },
                $inc: { usageCount: -1 }
            }
        );

        // Update license statuses
        const affectedLicenses = await License.find({ 'learners.userId': studentId });
        for (const license of affectedLicenses) {
            if (license.usageCount === 0) {
                license.status = 'AVAILABLE';
            } else if (license.usageCount < license.maxUsers) {
                license.status = 'PARTIALLY_USED';
            }
            await license.save();
        }

        // Delete the student account
        await User.findByIdAndDelete(studentId);

        return NextResponse.json({
            success: true,
            message: 'Compte étudiant supprimé définitivement',
            deletedStudent: {
                id: student._id,
                name: student.name,
                email: student.email
            }
        });

    } catch (error: any) {
        console.error('Delete Student Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
