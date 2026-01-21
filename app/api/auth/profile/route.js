import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

async function getAuthUser(request) {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  const prisma = getPrisma();
  if (!prisma) return null;
  
  try {
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
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function PUT(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { username, minecraftNick } = body;

    const prisma = getPrisma();
    
    // Check username uniqueness
    if (username && username !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ error: 'Bu kullanıcı adı kullanılıyor' }, { status: 400 });
      }
    }

    const avatarUrl = minecraftNick ? `https://mc-heads.net/avatar/${minecraftNick}` : user.avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username || user.username,
        minecraftNick: minecraftNick || user.minecraftNick,
        avatarUrl
      },
      select: {
        id: true,
        email: true,
        username: true,
        minecraftNick: true,
        role: true,
        avatarUrl: true
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
