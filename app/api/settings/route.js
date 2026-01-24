import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';

// GET /api/settings - Get site settings
export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ settings: null });
    }

    const prisma = getPrisma();
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.siteSettings.create({
        data: {
          id: 'main',
          discordUrl: 'https://discord.gg/serverlistrank',
          instagramUrl: 'https://instagram.com/serverlistrank',
          youtubeUrl: 'https://youtube.com/@serverlistrank'
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    // Error logged
    return NextResponse.json({ settings: null });
  }
}
