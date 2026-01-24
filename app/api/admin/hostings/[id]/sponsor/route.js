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

// PUT /api/admin/hostings/[id]/sponsor - Set hosting sponsor
export async function PUT(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { days } = body;

    const prisma = getPrisma();
    const sponsoredUntil = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

    const hosting = await prisma.hosting.update({
      where: { id },
      data: { isSponsored: days > 0, sponsoredUntil }
    });

    return NextResponse.json({ hosting, message: days > 0 ? 'Sponsor eklendi' : 'Sponsor kaldırıldı' });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
