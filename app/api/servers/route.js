import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/servers - List all approved servers
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const gameMode = searchParams.get('gameMode');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const prisma = getPrisma();

    const where = {
      approvalStatus: 'APPROVED',
      ...(platform && platform !== 'ALL' && { platform }),
      ...(gameMode && gameMode !== 'ALL' && { gameMode }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    };

    const [servers, total] = await Promise.all([
      prisma.server.findMany({
        where,
        orderBy: [
          { isSponsored: 'desc' },
          { voteCount: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          ip: true,
          port: true,
          platform: true,
          gameMode: true,
          version: true,
          shortDescription: true,
          tags: true,
          bannerUrl: true,
          logoUrl: true,
          isOnline: true,
          playerCount: true,
          maxPlayers: true,
          voteCount: true,
          monthlyVotes: true,
          isSponsored: true,
          sponsoredUntil: true,
          createdAt: true
        }
      }),
      prisma.server.count({ where })
    ]);

    return NextResponse.json({ 
      servers, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Servers list error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/servers - Create new server
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
    const { 
      name, ip, port, platform, gameMode, version, website, discord,
      bannerUrl, logoUrl, shortDescription, longDescription, tags,
      votifierHost, votifierPort, votifierPublicKey, votifierToken
    } = body;

    if (!name || !ip || !shortDescription || !version) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const server = await prisma.server.create({
      data: {
        id: uuidv4(),
        name,
        ip,
        port: port || 25565,
        platform: platform || 'JAVA',
        gameMode: gameMode || 'SURVIVAL',
        version,
        website,
        discord,
        bannerUrl,
        logoUrl,
        shortDescription,
        longDescription,
        tags: tags || [],
        votifierHost,
        votifierPort,
        votifierPublicKey,
        votifierToken,
        approvalStatus: 'PENDING',
        ownerId: user.id
      }
    });

    return NextResponse.json({ server, message: 'Sunucu eklendi, onay bekleniyor' });
  } catch (error) {
    console.error('Server create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
