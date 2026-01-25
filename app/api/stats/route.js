import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';

// GET /api/stats - Get public site statistics
export async function GET() {
  try {
    // Default stats when database not available
    const defaultStats = {
      serverCount: 0,
      totalPlayers: 0,
      totalVotes: 0
    };

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ 
        stats: defaultStats,
        source: 'default'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      });
    }

    const prisma = getPrisma();
    
    // Get approved server count
    const serverCount = await prisma.server.count({ 
      where: { approvalStatus: 'APPROVED' } 
    });

    // Get total players from approved servers
    const playerStats = await prisma.server.aggregate({
      where: { approvalStatus: 'APPROVED' },
      _sum: {
        playerCount: true,
        maxPlayers: true
      }
    });

    // Get total votes
    const totalVotes = await prisma.vote.count();

    // Also get monthly votes for extra stat
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyVotes = await prisma.vote.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });

    const stats = {
      serverCount,
      totalPlayers: playerStats._sum.playerCount || 0,
      maxPlayersCapacity: playerStats._sum.maxPlayers || 0,
      totalVotes,
      monthlyVotes
    };

    return NextResponse.json({ 
      stats,
      source: 'database'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ 
      stats: {
        serverCount: 0,
        totalPlayers: 0,
        totalVotes: 0
      },
      source: 'error'
    });
  }
}
