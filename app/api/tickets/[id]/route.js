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
      select: { id: true, email: true, username: true, role: true }
    });
    return user;
  } catch (error) {
    return null;
  }
}

// GET /api/tickets/[id] - Get single ticket with messages
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id: ticketId } = params;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { username: true, avatarUrl: true, role: true }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket bulunamadı' }, { status: 404 });
    }

    if (ticket.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Ticket get error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
