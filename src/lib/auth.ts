import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Special handling for local admin token from /admin page
        if (token.startsWith('local-admin-token-')) {
            return {
                userId: '507f1f77bcf86cd799439011', // Valid ObjectId format for admin
                email: 'matrainingconsulting@matc.com',
                role: 'ADMIN'
            };
        }

        // Special handling for demo account
        if (token.startsWith('demo-mock-token-')) {
            return {
                userId: '65ba00000000000000000001', // Fixed ID for demo
                email: 'demo@matcvault.com',
                role: 'STUDENT'
            };
        }

        // Handling for local testing users (from Admin Panel mockup)
        if (token.startsWith('local-mock-token-')) {
            return {
                userId: '65ba00000000000000000002',
                email: 'local@test.com',
                role: 'STUDENT'
            };
        }

        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export function createAuthResponse(message: string, status: number = 401) {
    return NextResponse.json(
        {
            success: false,
            message
        },
        { status }
    );
}

export async function requireAuth(
    request: NextRequest,
    allowedRoles?: string[]
): Promise<{ user: AuthUser } | NextResponse> {
    const user = await verifyToken(request);

    if (!user) {
        return createAuthResponse('Authentication required');
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return createAuthResponse('Insufficient permissions', 403);
    }

    return { user };
}
