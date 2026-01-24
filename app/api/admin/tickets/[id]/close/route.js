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
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
