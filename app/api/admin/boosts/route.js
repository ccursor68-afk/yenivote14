import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function requireAdmin(request) {
  if (!isDatabaseAvailable()) return null;
  const prisma = getPrisma();
  const user = await getAuthUser(request, prisma);
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// GET /api/admin/boosts - Get all boosts
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
    const boosts = await prisma.serverBoost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        server: {
          select: { id: true, name: true, ip: true }
        }
      }
    });

    return NextResponse.json({ boosts });
  } catch (error) {
    console.error('Admin boosts error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/boosts - Create a boost for server
export async function POST(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { serverId, durationDays = 7 } = body;

    if (!serverId) {
      return NextResponse.json({ error: 'Sunucu ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Check if server exists
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 });
    }

    // Deactivate any existing active boosts
    await prisma.serverBoost.updateMany({
      where: { serverId, isActive: true },
      data: { isActive: false }
    });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Create new boost
    const boost = await prisma.serverBoost.create({
      data: {
        id: uuidv4(),
        serverId,
        startTime,
        endTime,
        isActive: true
      }
    });

    // Update server sponsored status
    await prisma.server.update({
      where: { id: serverId },
      data: {
        isSponsored: true,
        sponsoredUntil: endTime
      }
    });

    return NextResponse.json({ 
      boost,
      message: `${server.name} için ${durationDays} günlük boost eklendi`
    });
  } catch (error) {
    console.error('Create boost error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/boosts - Deactivate a boost
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
    const boostId = searchParams.get('id');

    if (!boostId) {
      return NextResponse.json({ error: 'Boost ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    const boost = await prisma.serverBoost.findUnique({ 
      where: { id: boostId },
      include: { server: true }
    });

    if (!boost) {
      return NextResponse.json({ error: 'Boost bulunamadı' }, { status: 404 });
    }

    // Deactivate boost
    await prisma.serverBoost.update({
      where: { id: boostId },
      data: { isActive: false }
    });

    // Check if server has other active boosts
    const otherBoosts = await prisma.serverBoost.findFirst({
      where: {
        serverId: boost.serverId,
        isActive: true,
        endTime: { gt: new Date() }
      }
    });

    // Update server sponsored status if no other active boosts
    if (!otherBoosts) {
      await prisma.server.update({
        where: { id: boost.serverId },
        data: {
          isSponsored: false,
          sponsoredUntil: null
        }
      });
    }

    return NextResponse.json({ message: 'Boost deaktif edildi' });
  } catch (error) {
    console.error('Deactivate boost error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
