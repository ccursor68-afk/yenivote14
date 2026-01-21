import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';

// GET /api/banners - Get active banners (public)
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ banners: [] });
    }

    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const prisma = getPrisma();
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position && { position }),
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } }
        ]
      },
      orderBy: { priority: 'desc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
        position: true
      }
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Banners error:', error);
    return NextResponse.json({ banners: [] });
  }
}
