import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function requireAdmin(request) {
  if (!isDatabaseAvailable()) return null;
  const prisma = getPrisma();
  const user = await getAuthUser(request, prisma);
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// GET /api/admin/all-servers - Get ALL servers (admin)
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const prisma = getPrisma();
    const servers = await prisma.server.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, email: true, username: true } }
      }
    });

    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Admin all servers error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// PUT /api/admin/all-servers - Update server
export async function PUT(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, ip, port, version, shortDescription, longDescription, platform, gameMode, website, discord, tags, bannerUrl, logoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sunucu ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (ip !== undefined) updateData.ip = ip;
    if (port !== undefined) updateData.port = parseInt(port) || 25565;
    if (version !== undefined) updateData.version = version;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (longDescription !== undefined) updateData.longDescription = longDescription;
    if (platform !== undefined) updateData.platform = platform;
    if (gameMode !== undefined) updateData.gameMode = gameMode;
    if (website !== undefined) updateData.website = website;
    if (discord !== undefined) updateData.discord = discord;
    if (tags !== undefined) updateData.tags = tags;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    const server = await prisma.server.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ server, message: 'Sunucu güncellendi' });
  } catch (error) {
    console.error('Admin server update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/all-servers - Delete server
export async function DELETE(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Sunucu ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();
    
    // Delete related records first (cascade should handle this but being explicit)
    await prisma.serverStats.deleteMany({ where: { serverId: id } });
    await prisma.serverBoost.deleteMany({ where: { serverId: id } });
    await prisma.vote.deleteMany({ where: { serverId: id } });
    
    await prisma.server.delete({ where: { id } });

    return NextResponse.json({ message: 'Sunucu silindi' });
  } catch (error) {
    console.error('Admin server delete error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
