import { notFound } from 'next/navigation';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';
import HostingDetailClient from './HostingDetailClient';

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  if (!isDatabaseAvailable()) {
    return {
      title: 'Hosting - ServerListRank',
      description: 'Minecraft hosting detayları'
    };
  }

  try {
    const prisma = getPrisma();
    const hosting = await prisma.hosting.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        avgOverall: true,
        reviewCount: true,
        startingPrice: true,
        isVerified: true,
        logoUrl: true
      }
    });

    if (!hosting) {
      return {
        title: 'Hosting Bulunamadı - ServerListRank',
        description: 'Aradığınız hosting firması bulunamadı'
      };
    }

    const verified = hosting.isVerified ? '✓ Onaylı' : '';
    const title = `${hosting.name} ${verified} - ${hosting.avgOverall?.toFixed(1) || '0.0'}/5 Puan - Minecraft Hosting`;
    const description = `${hosting.description} | ${hosting.startingPrice}₺'den başlayan fiyatlar | ${hosting.reviewCount} değerlendirme`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: hosting.logoUrl ? [hosting.logoUrl] : [],
        type: 'website'
      },
      twitter: {
        card: 'summary',
        title,
        description
      }
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Hosting - ServerListRank',
      description: 'Minecraft hosting detayları'
    };
  }
}

export default async function HostingDetailPage({ params }) {
  const { slug } = params;
  
  return <HostingDetailClient slug={slug} />;
}
