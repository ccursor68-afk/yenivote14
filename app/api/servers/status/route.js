import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// Fetch server status from mcstatus.io API (more reliable)
async function fetchServerStatus(ip, port = 25565, platform = 'JAVA') {
  try {
    // mcstatus.io API - different endpoints for Java and Bedrock
    const serverAddress = port === 25565 || port === 19132 ? ip : `${ip}:${port}`;
    
    // Use bedrock endpoint for BEDROCK platform, java for others
    const apiType = platform === 'BEDROCK' ? 'bedrock' : 'java';
    const apiUrl = `https://api.mcstatus.io/v2/status/${apiType}/${serverAddress}`;
    
    console.log(`[mcstatus.io] Fetching ${apiType} status for: ${serverAddress}`);
    
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    if (!response.ok) {
      console.error(`[mcstatus.io] API returned ${response.status} for ${serverAddress}`);
      return { online: false, playerCount: 0, maxPlayers: 0 };
    }
    
    const data = await response.json();
    
    console.log(`[mcstatus.io] Response for ${serverAddress}:`, {
      online: data.online,
      players: data.players
    });
    
    return {
      online: data.online === true,
      playerCount: data.players?.online || 0,
      maxPlayers: data.players?.max || 0,
      version: data.version?.name_clean || data.version?.name || null,
      motd: data.motd?.clean || null,
      icon: data.icon || null
    };
  } catch (error) {
    console.error(`[mcstatus.io] Error fetching ${ip}:${port}:`, error.message);
    return { online: false, playerCount: 0, maxPlayers: 0 };
  }
}

// GET /api/servers/status - Get live status of all approved servers from mcstatus.io API
// This endpoint fetches REAL-TIME data from mcstatus.io
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();

    // Get all approved servers
    const servers = await prisma.server.findMany({
      where: { approvalStatus: 'APPROVED' },
      select: {
        id: true,
        ip: true,
        port: true,
        platform: true
      }
    });

    console.log(`[Status API] Fetching status for ${servers.length} servers`);

    // Fetch live status from mcstatus.io API for all servers in parallel
    // Limit concurrent requests to avoid rate limiting (5 req/sec)
    const batchSize = 5;
    const statusMap = {};
    
    for (let i = 0; i < servers.length; i += batchSize) {
      const batch = servers.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (server) => {
          const defaultPort = server.platform === 'BEDROCK' ? 19132 : 25565;
          const status = await fetchServerStatus(
            server.ip, 
            server.port || defaultPort,
            server.platform
          );
          return { id: server.id, status };
        })
      );
      
      batchResults.forEach(({ id, status }) => {
        statusMap[id] = {
          isOnline: status.online,
          playerCount: status.playerCount,
          maxPlayers: status.maxPlayers
        };
      });
      
      // Delay between batches to respect rate limit (5 req/sec)
      if (i + batchSize < servers.length) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    console.log(`[Status API] Status map:`, statusMap);

    // Optionally update database with latest status (fire and forget)
    // This keeps the database in sync for other queries
    Promise.all(
      Object.entries(statusMap).map(([id, status]) =>
        prisma.server.update({
          where: { id },
          data: {
            isOnline: status.isOnline,
            playerCount: status.playerCount,
            maxPlayers: status.maxPlayers,
            lastPingedAt: new Date()
          }
        }).catch((err) => {
          console.error(`[Status API] Failed to update server ${id}:`, err.message);
        })
      )
    ).catch(() => {});

    return NextResponse.json({ 
      status: statusMap,
      serverCount: servers.length,
      timestamp: new Date().toISOString(),
      source: 'mcstatus.io'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('[Status API] Error:', error.message);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
