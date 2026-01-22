import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/tickets - Get current user's tickets
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();
    const user = await getAuthUser(request, prisma);
    
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

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

    const prisma = getPrisma();
    const user = await getAuthUser(request, prisma);
    
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message, category, packageType } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Konu ve mesaj gerekli' }, { status: 400 });
    }

    // Determine category based on packageType
    let ticketCategory = category || 'GENERAL';
    if (packageType) {
      if (packageType.includes('SPONSOR')) {
        ticketCategory = 'SPONSORSHIP';
      } else if (packageType.includes('AD')) {
        ticketCategory = 'ADVERTISING';
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        id: uuidv4(),
        subject,
        category: ticketCategory,
        packageType: packageType || null,
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

    return NextResponse.json({ ticket, message: 'Destek talebi oluşturuldu' });
  } catch (error) {
    console.error('Ticket create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
