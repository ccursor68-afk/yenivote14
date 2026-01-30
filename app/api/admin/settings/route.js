import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/admin/settings - Get site settings
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();
    const user = await getAuthUser(request, prisma);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'main',
          discordUrl: null,
          instagramUrl: null,
          youtubeUrl: null,
          twitterUrl: null,
          contactEmail: null
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PUT /api/admin/settings - Update site settings
export async function PUT(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();
    const user = await getAuthUser(request, prisma);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { discordUrl, instagramUrl, youtubeUrl, twitterUrl, contactEmail } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        discordUrl: discordUrl || null,
        instagramUrl: instagramUrl || null,
        youtubeUrl: youtubeUrl || null,
        twitterUrl: twitterUrl || null,
        contactEmail: contactEmail || null
      },
      create: {
        id: 'main',
        discordUrl: discordUrl || null,
        instagramUrl: instagramUrl || null,
        youtubeUrl: youtubeUrl || null,
        twitterUrl: twitterUrl || null,
        contactEmail: contactEmail || null
      }
    });

    return NextResponse.json({ settings, message: 'Ayarlar kaydedildi' });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
