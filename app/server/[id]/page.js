import { notFound } from 'next/navigation';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';
import ServerDetailClient from './ServerDetailClient';

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = params;
  
  if (!isDatabaseAvailable()) {
    return {
      title: 'Sunucu - ServerListRank',
      description: 'Minecraft sunucu detayları'
    };
  }

  try {
    const prisma = getPrisma();
    const server = await prisma.server.findUnique({
      where: { id },
      select: {
        name: true,
        playerCount: true,
        maxPlayers: true,
        shortDescription: true,
        platform: true,
        version: true,
        bannerUrl: true,
        logoUrl: true
      }
    });

    if (!server) {
      return {
        title: 'Sunucu Bulunamadı - ServerListRank',
        description: 'Aradığınız sunucu bulunamadı'
      };
    }

    const title = `${server.name} - ${server.playerCount}/${server.maxPlayers} Oyuncu Çevrimiçi - Şimdi Katıl!`;
    const description = `${server.shortDescription} | ${server.platform} | v${server.version} | ${server.playerCount} oyuncu çevrimiçi`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: server.bannerUrl || server.logoUrl ? [server.bannerUrl || server.logoUrl] : [],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: server.bannerUrl || server.logoUrl ? [server.bannerUrl || server.logoUrl] : []
      }
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Sunucu - ServerListRank',
      description: 'Minecraft sunucu detayları'
    };
  }
}

export default async function ServerDetailPage({ params }) {
  const { id } = params;
  
  return <ServerDetailClient serverId={id} />;
}
