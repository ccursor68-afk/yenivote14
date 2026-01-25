import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function requireAdmin(request) {
  if (!isDatabaseAvailable()) return null;
  
  const prisma = getPrisma();
  const user = await getAuthUser(request, prisma);
  
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// GET /api/admin/users - Get all users
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        minecraftNick: true,
        role: true,
        createdAt: true,
        discordId: true,
        discordUsername: true,
        avatarUrl: true,
        _count: {
          select: { servers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
