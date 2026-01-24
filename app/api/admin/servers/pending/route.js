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

// GET /api/admin/servers/pending - Get pending servers
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
    const servers = await prisma.server.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        owner: {
          select: { id: true, email: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ servers });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
