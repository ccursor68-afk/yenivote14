import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// GET /api/servers/status - Get lightweight status of all approved servers
// This endpoint is optimized for frequent polling (every 60 seconds)
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();

    // Get only status-related fields for all approved servers
    const servers = await prisma.server.findMany({
      where: { approvalStatus: 'APPROVED' },
      select: {
        id: true,
        ip: true,
        port: true,
        isOnline: true,
        playerCount: true,
        maxPlayers: true,
        lastPingedAt: true
      }
    });

    // Transform to a map for easy lookup on frontend
    const statusMap = {};
    servers.forEach(server => {
      statusMap[server.id] = {
        isOnline: server.isOnline,
        playerCount: server.playerCount || 0,
        maxPlayers: server.maxPlayers || 0,
        lastPingedAt: server.lastPingedAt
      };
    });

    return NextResponse.json({ 
      status: statusMap,
      serverCount: servers.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
