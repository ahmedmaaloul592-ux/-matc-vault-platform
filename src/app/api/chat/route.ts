import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Determine accessible channels based on role
        const accessibleChannels = ['GLOBAL'];

        if (user.role === 'ADMIN' || user.role === 'admin') {
            accessibleChannels.push('ADMIN', 'PARTNER'); // Admin sees everything
        } else if (user.role === 'RESELLER_T1' || user.role === 'RESELLER_T2') {
            accessibleChannels.push('PARTNER'); // Partners see Partner chat
        }

        // Fetch messages that match accessible channels OR satisfy sender ownership (users can always see their own messages)
        // complex query: { $or: [ { channel: { $in: accessibleChannels } }, { senderId: user.userId } ] }

        const messages = await Message.find({
            $or: [
                { channel: { $in: accessibleChannels } },
                { senderId: user.userId }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(100);

        return NextResponse.json({ success: true, data: messages });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.content || !body.content.trim()) {
            return NextResponse.json({ success: false, message: 'Message content required' }, { status: 400 });
        }

        // Validate channel
        let channel = body.channel || 'GLOBAL';
        const validChannels = ['GLOBAL', 'ADMIN', 'PARTNER'];
        if (!validChannels.includes(channel)) {
            channel = 'GLOBAL';
        }

        // Role restriction: Non-Admins strictly shouldn't be able to post to ADMIN channel if they hacked the request?
        // But for this simple app, we can trust the client slightly or enforce logic.
        // Let's enforce: If trying to post to ADMIN, must be Admin.
        if (channel === 'ADMIN' && user.role !== 'ADMIN' && user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized channel' }, { status: 403 });
        }
        // If posting to PARTNER, must be PARTNER or ADMIN.
        // Assuming STUDENTS can only post GLOBAL.
        const isPartnerOrAdmin = ['RESELLER_T1', 'RESELLER_T2', 'ADMIN', 'admin'].includes(user.role);
        if (channel === 'PARTNER' && !isPartnerOrAdmin) {
            return NextResponse.json({ success: false, message: 'Unauthorized channel' }, { status: 403 });
        }

        const User = require('@/models/User').default;
        const dbUser = await User.findById(user.userId);

        const newMessage = await Message.create({
            senderId: user.userId,
            senderName: dbUser?.name || user.email.split('@')[0],
            senderRole: user.role,
            content: body.content,
            channel: channel
        });

        return NextResponse.json({ success: true, data: newMessage });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
