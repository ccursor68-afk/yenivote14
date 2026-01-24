import getPrisma, { isDatabaseAvailable } from '@/lib/db';
import BlogPostClient from './BlogPostClient';

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  if (!isDatabaseAvailable()) {
    return {
      title: 'Blog Yazısı',
      description: 'Minecraft blog yazısı'
    };
  }

  try {
    const prisma = getPrisma();
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        tags: true,
        blogType: true,
        author: { select: { username: true } },
        createdAt: true
      }
    });

    if (!post) {
      return {
        title: 'Yazı Bulunamadı',
        description: 'Aradığınız blog yazısı bulunamadı'
      };
    }

    const description = post.excerpt || post.content?.substring(0, 160) || 'Minecraft blog yazısı';
    const blogTypeLabels = {
      GUIDE: 'Rehber',
      UPDATE: 'Güncelleme',
      NEWS: 'Haber',
      TUTORIAL: 'Eğitim'
    };

    return {
      title: post.title,
      description,
      keywords: [...(post.tags || []), 'minecraft', 'blog', blogTypeLabels[post.blogType] || ''].filter(Boolean),
      authors: [{ name: post.author?.username || 'ServerListRank' }],
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        publishedTime: post.createdAt?.toISOString(),
        authors: [post.author?.username || 'ServerListRank'],
        images: post.coverImage ? [{
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title
        }] : [],
        tags: post.tags
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: post.coverImage ? [post.coverImage] : []
      }
    };
  } catch (error) {
    return {
      title: 'Blog Yazısı',
      description: 'Minecraft blog yazısı'
    };
  }
}

export default function BlogPostPage({ params }) {
  return <BlogPostClient slug={params.slug} />;
}
