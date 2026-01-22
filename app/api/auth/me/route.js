import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    // Debug: Log request info
    const cookieHeader = request.headers.get('cookie');
    console.log('Auth/me - Cookie header:', cookieHeader ? 'present' : 'missing');
    
    const token = await getTokenFromRequest(request);
    if (!token) {
      console.log('Auth/me - No token found');
      return NextResponse.json({ user: null });
    }
    
    console.log('Auth/me - Token found, verifying...');
    const payload = await verifyToken(token);
    if (!payload) {
      console.log('Auth/me - Invalid token');
      return NextResponse.json({ user: null });
    }
    
    if (!isDatabaseAvailable()) {
      console.log('Auth/me - Database not available');
      return NextResponse.json({ user: null });
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

    console.log('Auth/me - User found:', user ? user.email : 'null');
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}
