import { NextResponse } from 'next/server';
import getPrisma from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }
    
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ user: null });
    }
    
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}
