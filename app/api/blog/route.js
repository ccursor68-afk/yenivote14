import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// GET /api/blog - List published blog posts
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ posts: [] });
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const category = searchParams.get('category');

    const prisma = getPrisma();
    
    const where = {
      published: true,
      ...(tag && { tags: { has: tag } }),
      ...(category && { category: { slug: category } })
    };

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        createdAt: true,
        author: {
          select: { username: true, avatarUrl: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    // Get all unique tags for filtering
    const allPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { tags: true }
    });
    const allTags = [...new Set(allPosts.flatMap(p => p.tags))];

    return NextResponse.json({ posts, tags: allTags });
  } catch (error) {
    console.error('Blog list error:', error);
    return NextResponse.json({ posts: [], tags: [] });
  }
}
