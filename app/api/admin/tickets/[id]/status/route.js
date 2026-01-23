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

// PUT /api/admin/tickets/[id]/status - Update ticket status
export async function PUT(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ ticket, message: 'Ticket durumu güncellendi' });
  } catch (error) {
    console.error('Ticket status update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
