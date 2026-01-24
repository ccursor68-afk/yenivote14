import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Force dynamic - no caching for auth endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ user: null }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }
    
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ user: null }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }
    
    const prisma = getPrisma();
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        minecraftNick: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  }
}
