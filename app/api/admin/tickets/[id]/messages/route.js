import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function requireAdmin(request) {
  if (!isDatabaseAvailable()) return null;
  const prisma = getPrisma();
  const user = await getAuthUser(request, prisma);
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// GET /api/admin/tickets/[id]/messages - Get ticket messages (admin)
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { id } = params;
    const prisma = getPrisma();

    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { email: true, username: true } }
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/tickets/[id]/messages - Add admin reply
export async function POST(request, { params }) {
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
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Mesaj içeriği gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket bulunamadı' }, { status: 404 });
    }

    // Create admin message
    const message = await prisma.ticketMessage.create({
      data: {
        id: uuidv4(),
        content: content.trim(),
        ticketId: id,
        userId: admin.id,
        isAdmin: true
      }
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    if (ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return NextResponse.json({ message, success: true });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
