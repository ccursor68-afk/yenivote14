import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { pingMinecraftServer } from '@/lib/minecraft-ping';

// POST /api/servers/ping - Ping all approved servers and update stats
// This endpoint should be called by a cron job every 10 minutes
export async function POST(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    // Optional: Check for API key for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow without auth for development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const prisma = getPrisma();

    // Get all approved servers
    const servers = await prisma.server.findMany({
      where: { approvalStatus: 'APPROVED' },
      select: { id: true, ip: true, port: true, name: true }
    });

    const results = [];
    const now = new Date();

    // Ping servers in parallel (batch of 10)
    const batchSize = 10;
    for (let i = 0; i < servers.length; i += batchSize) {
      const batch = servers.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (server) => {
          try {
            const pingResult = await pingMinecraftServer(server.ip, server.port);
            
            // Update server status
            await prisma.server.update({
              where: { id: server.id },
              data: {
                isOnline: pingResult.online,
                playerCount: pingResult.playerCount || 0,
                maxPlayers: pingResult.maxPlayers || 0,
                lastPingedAt: now
              }
            });

            // Record stats for history
            await prisma.serverStats.create({
              data: {
                id: uuidv4(),
                serverId: server.id,
                playerCount: pingResult.playerCount || 0,
                maxPlayers: pingResult.maxPlayers || 0,
                isOnline: pingResult.online,
                recordedAt: now
              }
            });

            return {
              id: server.id,
              name: server.name,
              online: pingResult.online,
              players: pingResult.playerCount,
              maxPlayers: pingResult.maxPlayers
            };
          } catch (err) {
            console.error(`Ping failed for ${server.name}:`, err.message);
            return {
              id: server.id,
              name: server.name,
              online: false,
              error: err.message
            };
          }
        })
      );
      
      results.push(...batchResults);
    }

    // Clean up old stats (keep only last 48 hours)
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await prisma.serverStats.deleteMany({
      where: { recordedAt: { lt: cutoffDate } }
    });

    return NextResponse.json({
      success: true,
      pinged: results.length,
      online: results.filter(r => r.online).length,
      offline: results.filter(r => !r.online).length,
      results
    });
  } catch (error) {
    console.error('Ping all servers error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// GET /api/servers/ping - Ping a single server (for testing)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');
    const port = parseInt(searchParams.get('port') || '25565');

    if (!ip) {
      return NextResponse.json({ error: 'IP adresi gerekli' }, { status: 400 });
    }

    const result = await pingMinecraftServer(ip, port);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Single ping error:', error);
    return NextResponse.json({ error: 'Ping hatası', details: error.message }, { status: 500 });
  }
}
