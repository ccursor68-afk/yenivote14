import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { trackServerVisit, checkAndAwardBadges } from '@/lib/badges';
import { v4 as uuidv4 } from 'uuid';

// GET /api/servers/[id]/stats - Get server analytics
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id } = params;
    const prisma = getPrisma();

    // Get server with stats
    const server = await prisma.server.findUnique({
      where: { id },
      include: {
        stats: {
          where: {
            recordedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: { recordedAt: 'asc' }
        },
        boosts: {
          where: {
            isActive: true,
            endTime: { gt: new Date() }
          }
        }
      }
    });

    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    // Format stats for chart
    const playerHistory = server.stats.map(stat => ({
      time: stat.recordedAt.toISOString(),
      playerCount: stat.playerCount,
      maxPlayers: stat.maxPlayers,
      isOnline: stat.isOnline
    }));

    // Get active boost
    const activeBoost = server.boosts.length > 0 ? {
      startTime: server.boosts[0].startTime,
      endTime: server.boosts[0].endTime,
      remainingHours: Math.max(0, Math.ceil((new Date(server.boosts[0].endTime) - new Date()) / (1000 * 60 * 60)))
    } : null;

    return NextResponse.json({
      clickCount: server.clickCount,
      playerHistory,
      currentPlayers: server.playerCount,
      maxPlayers: server.maxPlayers,
      isOnline: server.isOnline,
      lastPingedAt: server.lastPingedAt,
      voteCount: server.voteCount,
      monthlyVotes: server.monthlyVotes,
      activeBoost
    });
  } catch (error) {
    console.error('Server stats error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/servers/[id]/stats - Record a visit (increment click count)
export async function POST(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id } = params;
    const prisma = getPrisma();

    // Check if server exists
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    // Increment click count
    await prisma.server.update({
      where: { id },
      data: { clickCount: { increment: 1 } }
    });

    // If user is logged in, track visit for Explorer badge
    const user = await getAuthUser(request, prisma);
    if (user) {
      await trackServerVisit(prisma, user.id, id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record visit error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
