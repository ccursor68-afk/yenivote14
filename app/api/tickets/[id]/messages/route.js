import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
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
      select: { id: true, email: true, username: true, role: true }
    });
    return user;
  } catch (error) {
    return null;
  }
}

// POST /api/tickets/[id]/messages - Add message to ticket
export async function POST(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id: ticketId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket bulunamadı' }, { status: 404 });
    }

    if (ticket.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const message = await prisma.ticketMessage.create({
      data: {
        id: uuidv4(),
        content,
        ticketId,
        userId: user.id,
        isAdmin: user.role === 'ADMIN'
      }
    });

    // Update ticket status if admin responds
    if (user.role === 'ADMIN' && ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Ticket message error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
