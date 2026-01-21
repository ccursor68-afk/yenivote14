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

// GET /api/tickets - Get current user's tickets
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const prisma = getPrisma();
    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Tickets list error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/tickets - Create new ticket
export async function POST(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Konu ve mesaj gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    const ticket = await prisma.ticket.create({
      data: {
        id: uuidv4(),
        subject,
        userId: user.id,
        messages: {
          create: {
            id: uuidv4(),
            content: message,
            userId: user.id,
            isAdmin: false
          }
        }
      },
      include: { messages: true }
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Ticket create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
