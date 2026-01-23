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

// PUT /api/admin/hostings/[id]/verify - Toggle hosting verification
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
    const prisma = getPrisma();

    const hosting = await prisma.hosting.findUnique({ where: { id } });
    if (!hosting) {
      return NextResponse.json({ error: 'Hosting bulunamadı' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { isVerified } = body;

    const updatedHosting = await prisma.hosting.update({
      where: { id },
      data: {
        isVerified: isVerified !== undefined ? isVerified : !hosting.isVerified,
        verifiedAt: isVerified !== undefined 
          ? (isVerified ? new Date() : null)
          : (!hosting.isVerified ? new Date() : null)
      }
    });

    return NextResponse.json({ 
      hosting: updatedHosting,
      message: updatedHosting.isVerified ? 'Hosting onaylandı' : 'Hosting onayı kaldırıldı'
    });
  } catch (error) {
    console.error('Hosting verify error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
