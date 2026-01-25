import getPrisma, { isDatabaseAvailable } from '@/lib/db'
import BlogPostClient from './BlogPostClient'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://serverlistrank.com'

export async function generateMetadata({ params }) {
  const { slug } = await params
  
  if (!isDatabaseAvailable()) {
    return {
      title: 'Blog Yazısı',
      description: 'ServerListRank blog yazısı',
    }
  }

  try {
    const prisma = getPrisma()
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { username: true } },
        category: { select: { name: true } },
      },
    })

    if (!post) {
      return {
        title: 'Yazı Bulunamadı',
        description: 'Bu blog yazısı bulunamadı.',
      }
    }

    const blogTypeLabels = {
      GUIDE: 'Rehber',
      UPDATE: 'Güncelleme',
      NEWS: 'Haber',
      TUTORIAL: 'Eğitim',
    }

    const typeLabel = blogTypeLabels[post.blogType] || ''
    const authorName = post.author?.username || 'ServerListRank'
    const tags = post.tags || []

    return {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      keywords: ['minecraft', 'blog', typeLabel.toLowerCase(), ...tags],
      authors: [{ name: authorName }],
      openGraph: {
        type: 'article',
        locale: 'tr_TR',
        url: `${BASE_URL}/blog/${slug}`,
        title: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        siteName: 'ServerListRank',
        images: post.coverImage ? [
          {
            url: post.coverImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ] : [],
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: [authorName],
        tags: tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        images: post.coverImage ? [post.coverImage] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/blog/${slug}`,
      },
    }
  } catch (error) {
    console.error('Blog metadata error:', error)
    return {
      title: 'Blog Yazısı',
      description: 'ServerListRank blog yazısı',
    }
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  
  let post = null
  let jsonLd = null

  if (isDatabaseAvailable()) {
    try {
      const prisma = getPrisma()
      post = await prisma.blogPost.findUnique({
        where: { slug, published: true },
        include: {
          author: { select: { username: true, avatarUrl: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
      })

      if (post) {
        // JSON-LD Structured Data
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || post.content.substring(0, 160),
          image: post.coverImage || `${BASE_URL}/og-image.png`,
          datePublished: post.createdAt.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: {
            '@type': 'Person',
            name: post.author?.username || 'ServerListRank',
          },
          publisher: {
            '@type': 'Organization',
            name: 'ServerListRank',
            logo: {
              '@type': 'ImageObject',
              url: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/blog/${slug}`,
          },
          keywords: (post.tags || []).join(', '),
        }
      }
    } catch (error) {
      console.error('Blog post fetch error:', error)
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostClient slug={slug} initialPost={post} />
    </>
  )
}
