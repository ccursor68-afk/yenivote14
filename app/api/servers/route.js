import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { validateServerForm, checkBadWords, isValidHostnameOrIP, isValidPort } from '@/lib/content-filter';

// Valid game modes
const VALID_GAME_MODES = ['SURVIVAL', 'SKYBLOCK', 'FACTION', 'TOWNY', 'CREATIVE', 'MINIGAMES', 'PRISON', 'KITPVP', 'OTHER'];

// GET /api/servers - List all approved servers
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const gameMode = searchParams.get('gameMode');
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const prisma = getPrisma();

    const where = {
      approvalStatus: 'APPROVED',
      ...(platform && platform !== 'ALL' && { platform }),
      ...(gameMode && gameMode !== 'ALL' && { gameModes: { has: gameMode } }),
      ...(country && country !== 'ALL' && { countryCode: country }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    };

    // Get servers with active boosts first, then by votes
    const [servers, total] = await Promise.all([
      prisma.server.findMany({
        where,
        orderBy: [
          { isSponsored: 'desc' },
          { sponsoredUntil: 'desc' }, // Boost remaining time
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
          gameModes: true,
          version: true,
          countryCode: true,
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
          clickCount: true,
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
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
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
      name, ip, port, platform, gameModes, version, website, discord,
      bannerUrl, shortDescription, longDescription, tags,
      votifierHost, votifierPort, votifierPublicKey, votifierToken,
      serverVerified // Flag to indicate server was pinged and verified
    } = body;

    // === VALIDATION ===

    // Check if server was verified (pinged successfully)
    if (!serverVerified) {
      return NextResponse.json({ 
        error: 'Sunucu durumu doğrulanmalıdır. Lütfen IP kontrol butonunu kullanın.' 
      }, { status: 400 });
    }

    // IP/Hostname validation
    if (!ip || !isValidHostnameOrIP(ip)) {
      return NextResponse.json({ 
        error: 'Geçerli bir IP adresi veya hostname girin' 
      }, { status: 400 });
    }

    // Port validation
    if (port && !isValidPort(port)) {
      return NextResponse.json({ 
        error: 'Port 1-65535 arasında olmalıdır' 
      }, { status: 400 });
    }

    // Name validation
    if (!name || name.trim().length < 3 || name.trim().length > 50) {
      return NextResponse.json({ 
        error: 'Sunucu adı 3-50 karakter arasında olmalıdır' 
      }, { status: 400 });
    }

    // Content filter - Name
    const nameCheck = checkBadWords(name);
    if (nameCheck.hasBadWords) {
      return NextResponse.json({ 
        error: 'Sunucu adı uygunsuz kelimeler içeriyor',
        field: 'name'
      }, { status: 400 });
    }

    // Short description validation
    if (!shortDescription || shortDescription.trim().length < 10 || shortDescription.trim().length > 150) {
      return NextResponse.json({ 
        error: 'Kısa açıklama 10-150 karakter arasında olmalıdır' 
      }, { status: 400 });
    }

    // Content filter - Description
    const descCheck = checkBadWords(shortDescription);
    if (descCheck.hasBadWords) {
      return NextResponse.json({ 
        error: 'Kısa açıklama uygunsuz kelimeler içeriyor',
        field: 'shortDescription'
      }, { status: 400 });
    }

    // Long description content filter
    if (longDescription) {
      const longDescCheck = checkBadWords(longDescription);
      if (longDescCheck.hasBadWords) {
        return NextResponse.json({ 
          error: 'Detaylı açıklama uygunsuz kelimeler içeriyor',
          field: 'longDescription'
        }, { status: 400 });
      }
    }

    // Game modes validation (1-3 required)
    if (!gameModes || !Array.isArray(gameModes) || gameModes.length === 0) {
      return NextResponse.json({ 
        error: 'En az 1 oyun modu seçmelisiniz' 
      }, { status: 400 });
    }

    if (gameModes.length > 3) {
      return NextResponse.json({ 
        error: 'En fazla 3 oyun modu seçebilirsiniz' 
      }, { status: 400 });
    }

    // Validate each game mode
    for (const mode of gameModes) {
      if (!VALID_GAME_MODES.includes(mode)) {
        return NextResponse.json({ 
          error: `Geçersiz oyun modu: ${mode}` 
        }, { status: 400 });
      }
    }

    // Version validation
    if (!version) {
      return NextResponse.json({ 
        error: 'Minecraft versiyonu zorunludur' 
      }, { status: 400 });
    }

    // Check for duplicate IP
    const existingServer = await prisma.server.findFirst({
      where: { 
        ip: ip.toLowerCase(),
        port: port || 25565
      }
    });

    if (existingServer) {
      return NextResponse.json({ 
        error: 'Bu IP adresi ve port ile zaten bir sunucu kayıtlı' 
      }, { status: 400 });
    }

    // Create server
    const server = await prisma.server.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        ip: ip.toLowerCase().trim(),
        port: port || 25565,
        platform: platform || 'JAVA',
        gameMode: gameModes[0], // Primary game mode (for backwards compatibility)
        gameModes: gameModes, // All selected game modes
        version,
        website: website || null,
        discord: discord || null,
        bannerUrl: bannerUrl || null,
        logoUrl: null, // Logo URL removed - using mc-api.net favicon
        shortDescription: shortDescription.trim(),
        longDescription: longDescription?.trim() || null,
        tags: tags || [],
        votifierHost: votifierHost || null,
        votifierPort: votifierPort ? parseInt(votifierPort) : null,
        votifierPublicKey: votifierPublicKey || null,
        votifierToken: votifierToken || null,
        approvalStatus: 'PENDING',
        ownerId: user.id
      }
    });

    return NextResponse.json({ 
      server, 
      message: 'Sunucu başarıyla eklendi! Admin onayı bekleniyor.' 
    });
  } catch (error) {
    console.error('Server creation error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
