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

// PUT /api/admin/users/[id]/role - Update user role
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
    const { role } = body;

    if (!role || !['USER', 'ADMIN', 'VERIFIED_HOSTING'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
    }

    const prisma = getPrisma();

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      message: 'Kullanıcı rolü güncellendi'
    });
  } catch (error) {
    console.error('User role update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
