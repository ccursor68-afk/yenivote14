import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/servers/[id]/boost - Get boost status
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id } = params;
    const prisma = getPrisma();

    const boosts = await prisma.serverBoost.findMany({
      where: {
        serverId: id,
        isActive: true,
        endTime: { gt: new Date() }
      },
      orderBy: { endTime: 'desc' }
    });

    const activeBoost = boosts.length > 0 ? {
      id: boosts[0].id,
      startTime: boosts[0].startTime,
      endTime: boosts[0].endTime,
      remainingHours: Math.max(0, Math.ceil((new Date(boosts[0].endTime) - new Date()) / (1000 * 60 * 60))),
      remainingDays: Math.max(0, Math.ceil((new Date(boosts[0].endTime) - new Date()) / (1000 * 60 * 60 * 24)))
    } : null;

    return NextResponse.json({ activeBoost, hasBoost: !!activeBoost });
  } catch (error) {
    console.error('Boost status error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/servers/[id]/boost - Request boost (creates ticket)
export async function POST(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();
    const user = await getAuthUser(request, prisma);
    
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id } = params;

    // Check if user owns this server
    const server = await prisma.server.findUnique({
      where: { id },
      select: { id: true, name: true, ownerId: true }
    });

    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    if (server.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu sunucu size ait değil' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { duration = 7 } = body; // Default 7 days

    // Create boost request ticket
    const ticket = await prisma.ticket.create({
      data: {
        id: uuidv4(),
        subject: `Boost Talebi: ${server.name}`,
        category: 'SPONSORSHIP',
        status: 'OPEN',
        userId: user.id,
        packageType: `SERVER_BOOST_${duration}D`
      }
    });

    // Create initial message
    await prisma.ticketMessage.create({
      data: {
        id: uuidv4(),
        content: `Merhaba,\n\n"${server.name}" sunucum için ${duration} günlük boost talep ediyorum.\n\nSunucu ID: ${server.id}\n\nLütfen ödeme bilgilerini iletir misiniz?`,
        ticketId: ticket.id,
        userId: user.id,
        isAdmin: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      ticketId: ticket.id,
      message: 'Boost talebi oluşturuldu. Destek ekibimiz en kısa sürede dönüş yapacaktır.' 
    });
  } catch (error) {
    console.error('Boost request error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
