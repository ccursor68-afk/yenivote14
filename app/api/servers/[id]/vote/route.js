import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { sendVotifierVote } from '@/lib/votifier';

// Helper to get client IP
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || '127.0.0.1';
}

// POST /api/servers/[id]/vote - Vote for a server
export async function POST(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id: serverId } = params;
    const body = await request.json();
    const { minecraftUsername } = body;

    if (!minecraftUsername || minecraftUsername.length < 3 || minecraftUsername.length > 16) {
      return NextResponse.json({ error: 'Geçerli bir Minecraft kullanıcı adı girin (3-16 karakter)' }, { status: 400 });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(minecraftUsername)) {
      return NextResponse.json({ error: 'Minecraft kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir' }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const prisma = getPrisma();

    // Get server
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    if (server.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Bu sunucu henüz onaylanmamış' }, { status: 400 });
    }

    // Check 24-hour cooldown
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check IP cooldown
    const existingIPVote = await prisma.vote.findFirst({
      where: {
        serverId,
        ipAddress: clientIP,
        createdAt: { gte: twentyFourHoursAgo }
      }
    });

    if (existingIPVote) {
      const nextVoteTime = new Date(existingIPVote.createdAt.getTime() + 24 * 60 * 60 * 1000);
      return NextResponse.json({ 
        error: 'Bu IP adresinden son 24 saat içinde oy verilmiş',
        nextVoteTime 
      }, { status: 429 });
    }

    // Check username cooldown for this server
    const existingUsernameVote = await prisma.vote.findFirst({
      where: {
        serverId,
        minecraftUsername: minecraftUsername,
        createdAt: { gte: twentyFourHoursAgo }
      }
    });

    if (existingUsernameVote) {
      const nextVoteTime = new Date(existingUsernameVote.createdAt.getTime() + 24 * 60 * 60 * 1000);
      return NextResponse.json({ 
        error: 'Bu kullanıcı adı ile son 24 saat içinde oy verilmiş',
        nextVoteTime 
      }, { status: 429 });
    }

    // Send vote to NuVotifier if configured (username EXACTLY as entered)
    let votifierResult = null;
    if (server.votifierHost && server.votifierPort && server.votifierPublicKey) {
      try {
        votifierResult = await sendVotifierVote(server, minecraftUsername, clientIP);
      } catch (err) {
        console.error('Votifier error:', err);
        // Continue even if votifier fails - record vote anyway
        votifierResult = { success: false, error: err.message };
      }
    }

    // Record vote (store username as entered for display, case-sensitive check above)
    const vote = await prisma.vote.create({
      data: {
        id: uuidv4(),
        serverId,
        minecraftUsername: minecraftUsername,
        ipAddress: clientIP
      }
    });

    // Update server vote count
    await prisma.server.update({
      where: { id: serverId },
      data: {
        voteCount: { increment: 1 },
        monthlyVotes: { increment: 1 }
      }
    });

    return NextResponse.json({ 
      message: 'Oy başarıyla kaydedildi!',
      vote,
      votifier: votifierResult
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
