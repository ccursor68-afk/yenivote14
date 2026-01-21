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

// PUT /api/admin/tickets/[id]/close - Close ticket
export async function PUT(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { id: ticketId } = params;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' }
    });

    return NextResponse.json({ ticket, message: 'Ticket kapatıldı' });
  } catch (error) {
    console.error('Admin close ticket error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
