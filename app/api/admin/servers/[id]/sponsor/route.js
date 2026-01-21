import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

async function requireAdmin(request) {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  const prisma = getPrisma();
  if (!prisma) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, username: true, role: true }
    });
    if (!user || user.role !== 'ADMIN') return null;
    return user;
  } catch (error) {
    return null;
  }
}

// PUT /api/admin/servers/[id]/sponsor - Set server sponsor status
export async function PUT(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { id: serverId } = params;
    const body = await request.json();
    const { days } = body; // Number of days to sponsor

    const prisma = getPrisma();
    
    const sponsoredUntil = days > 0 
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;

    const server = await prisma.server.update({
      where: { id: serverId },
      data: { 
        isSponsored: days > 0,
        sponsoredUntil
      }
    });

    return NextResponse.json({ server, message: days > 0 ? 'Sponsor eklendi' : 'Sponsor kaldırıldı' });
  } catch (error) {
    console.error('Admin sponsor error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
