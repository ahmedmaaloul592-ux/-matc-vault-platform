import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const authUser = await verifyToken(req);

        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch real transactions from DB
        const transactions = await Transaction.find({ userId: authUser.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Calculate totals from real transactions
        let totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        // MVP Fallback: If no transactions exist yet, estimate based on network size
        // (This helps the user see "Potential" or "Estimated" earnings if they imported users without creating transaction records)
        if (transactions.length === 0) {
            const user = await User.findById(authUser.userId);
            if (user) {
                // Mock calculation logic for MVP display
                // If Master: 100€ per Partner
                // If Partner: 35€ per Student (approx)
                // This is just a placeholder until real transactions are recorded.
                // We will return 0 if strictly following DB, but let's be strict for "Real Finance".
                totalRevenue = 0;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                balance: totalRevenue, // Assuming no withdrawals yet
                totalRevenue,
                transactions
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const authUser = await verifyToken(req);
        if (!authUser) return NextResponse.json({ success: false }, { status: 401 });

        const body = await req.json();

        const transaction = await Transaction.create({
            userId: authUser.userId,
            ...body
        });

        return NextResponse.json({ success: true, data: transaction });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
