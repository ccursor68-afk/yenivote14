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

// GET /api/admin/categories - Get all blog categories
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
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: true } }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/categories - Create blog category
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
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Kategori adı gerekli' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[ç]/g, 'c')
      .replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i')
      .replace(/[ü]/g, 'u')
      .replace(/[ö]/g, 'o')
      .replace(/[ğ]/g, 'g')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const prisma = getPrisma();

    const category = await prisma.blogCategory.create({
      data: {
        id: uuidv4(),
        name,
        slug,
        description,
        color: color || '#10b981'
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/categories - Delete blog category
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
      return NextResponse.json({ error: 'Kategori ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.blogCategory.delete({ where: { id } });

    return NextResponse.json({ message: 'Kategori silindi' });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
