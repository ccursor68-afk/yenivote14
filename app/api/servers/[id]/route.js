import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/servers/[id] - Get single server
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id } = params;
    const prisma = getPrisma();

    const server = await prisma.server.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            minecraftNick: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    // Hide votifier credentials from public
    const { votifierPublicKey, votifierToken, ...publicServer } = server;
    const hasVotifier = !!(server.votifierHost && server.votifierPort && server.votifierPublicKey);

    return NextResponse.json({ 
      server: { ...publicServer, hasVotifier } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PUT /api/servers/[id] - Update server
export async function PUT(request, { params }) {
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

    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    if (server.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      'name', 'ip', 'port', 'platform', 'gameMode', 'version', 'website', 'discord',
      'bannerUrl', 'logoUrl', 'shortDescription', 'longDescription', 'tags',
      'votifierHost', 'votifierPort', 'votifierPublicKey', 'votifierToken'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedServer = await prisma.server.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ server: updatedServer });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE /api/servers/[id] - Delete server
export async function DELETE(request, { params }) {
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

    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    if (server.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    await prisma.server.delete({ where: { id } });

    return NextResponse.json({ message: 'Sunucu silindi' });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
