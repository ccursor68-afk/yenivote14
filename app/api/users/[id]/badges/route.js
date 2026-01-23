import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { BADGE_INFO } from '@/lib/badges';

// GET /api/users/[id]/badges - Get user badges
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { id } = params;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        badges: {
          orderBy: { earnedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Enhance badges with display info
    const badges = user.badges.map(badge => ({
      ...badge,
      ...BADGE_INFO[badge.badgeType],
      type: badge.badgeType
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
