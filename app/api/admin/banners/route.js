import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

async function requireAdmin(request) {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  const prisma = getPrisma();
  if (!prisma) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, username: true, role: true }
    });
    if (!user || user.role !== 'ADMIN') return null;
    return user;
  } catch (error) {
    return null;
  }
}

// GET /api/admin/banners - Get all banners
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
    const banners = await prisma.banner.findMany({
      orderBy: [{ position: 'asc' }, { priority: 'desc' }]
    });

    return NextResponse.json({ banners });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/banners - Create banner
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
    const { title, subtitle, imageUrl, linkUrl, position, isActive, startDate, endDate, priority } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Başlık ve görsel URL gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    const banner = await prisma.banner.create({
      data: {
        id: uuidv4(),
        title,
        subtitle,
        imageUrl,
        linkUrl,
        position: position || 'home_top',
        isActive: isActive !== false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority || 0
      }
    });

    return NextResponse.json({ banner });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// PUT /api/admin/banners - Update banner
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID gerekli' }, { status: 400 });
    }

    // Handle date fields
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const prisma = getPrisma();
    const banner = await prisma.banner.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ banner });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/banners - Delete banner
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
      return NextResponse.json({ error: 'Banner ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({ message: 'Banner silindi' });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
