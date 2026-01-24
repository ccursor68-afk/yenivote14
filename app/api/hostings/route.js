import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/hostings - List all approved hostings
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ hostings: [] }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'avgOverall';

    const prisma = getPrisma();

    // Only filter by approvalStatus, not isActive
    const where = {
      approvalStatus: 'APPROVED',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const hostings = await prisma.hosting.findMany({
      where,
      orderBy: [
        { isVerified: 'desc' },
        { isSponsored: 'desc' },
        { avgOverall: 'desc' }
      ],
      include: {
        owner: {
          select: { username: true }
        }
      }
    });

    return NextResponse.json({ hostings }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    return NextResponse.json({ hostings: [], error: 'Sunucu hatası' }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}

// POST /api/hostings - Create new hosting
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
    const { name, website, logoUrl, description, longDescription, features, startingPrice } = body;

    if (!name || !website || !description || !startingPrice) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[ç]/g, 'c').replace(/[ş]/g, 's').replace(/[ı]/g, 'i')
      .replace(/[ü]/g, 'u').replace(/[ö]/g, 'o').replace(/[ğ]/g, 'g')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const hosting = await prisma.hosting.create({
      data: {
        id: uuidv4(),
        name,
        slug: `${slug}-${Date.now()}`,
        website,
        logoUrl,
        description,
        longDescription,
        features: features || [],
        startingPrice: parseFloat(startingPrice),
        approvalStatus: 'PENDING',
        isActive: true,
        ownerId: user.id
      }
    });

    return NextResponse.json({ hosting, message: 'Hosting eklendi, onay bekleniyor' });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
