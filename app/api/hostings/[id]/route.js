import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// GET /api/hostings/[id] - Get single hosting
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id } = params;
    const prisma = getPrisma();

    const hosting = await prisma.hosting.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        owner: { select: { username: true } },
        reviews: {
          include: {
            user: { select: { username: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!hosting) {
      return NextResponse.json({ error: 'Hosting bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ hosting });
  } catch (error) {
    console.error('Hosting get error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
