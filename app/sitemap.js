import getPrisma, { isDatabaseAvailable } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://serverlistrank.com'

export default async function sitemap() {
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hostings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  let dynamicRoutes = []

  try {
    if (isDatabaseAvailable()) {
      const prisma = getPrisma()
      
      // Get all approved servers
      const servers = await prisma.server.findMany({
        where: { approvalStatus: 'APPROVED' },
        select: { id: true, updatedAt: true },
      })

      const serverRoutes = servers.map((server) => ({
        url: `${BASE_URL}/server/${server.id}`,
        lastModified: server.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
      }))

      // Get all published blog posts
      const blogPosts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      })

      const blogRoutes = blogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      }))

      // Get all hostings
      const hostings = await prisma.hosting.findMany({
        where: { isVerified: true },
        select: { slug: true, updatedAt: true },
      })

      const hostingRoutes = hostings.map((hosting) => ({
        url: `${BASE_URL}/hosting/${hosting.slug}`,
        lastModified: hosting.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))

      dynamicRoutes = [...serverRoutes, ...blogRoutes, ...hostingRoutes]
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return [...staticRoutes, ...dynamicRoutes]
}
