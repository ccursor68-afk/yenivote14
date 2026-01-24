import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// Helper to get client IP
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || '127.0.0.1';
}

// GET /api/servers/[id]/vote-status - Check if user can vote
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id: serverId } = params;
    const { searchParams } = new URL(request.url);
    const minecraftUsername = searchParams.get('username');
    
    const clientIP = getClientIP(request);
    const prisma = getPrisma();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const ipVote = await prisma.vote.findFirst({
      where: {
        serverId,
        ipAddress: clientIP,
        createdAt: { gte: twentyFourHoursAgo }
      }
    });

    let usernameVote = null;
    if (minecraftUsername) {
      usernameVote = await prisma.vote.findFirst({
        where: {
          serverId,
          minecraftUsername: minecraftUsername,
          createdAt: { gte: twentyFourHoursAgo }
        }
      });
    }

    const canVote = !ipVote && !usernameVote;
    const nextVoteTime = ipVote 
      ? new Date(ipVote.createdAt.getTime() + 24 * 60 * 60 * 1000)
      : usernameVote 
        ? new Date(usernameVote.createdAt.getTime() + 24 * 60 * 60 * 1000)
        : null;

    return NextResponse.json({ canVote, nextVoteTime });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
