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
    const blogType = searchParams.get('type'); // NEW: Filter by type

    const prisma = getPrisma();
    
    const where = {
      published: true,
      ...(tag && { tags: { has: tag } }),
      ...(category && { category: { slug: category } }),
      ...(blogType && { blogType: blogType.toUpperCase() }) // NEW: Filter by type
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
        blogType: true, // NEW: Include blog type
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

    // NEW: Get blog type counts
    const typeCounts = {
      GUIDE: await prisma.blogPost.count({ where: { published: true, blogType: 'GUIDE' } }),
      UPDATE: await prisma.blogPost.count({ where: { published: true, blogType: 'UPDATE' } }),
      NEWS: await prisma.blogPost.count({ where: { published: true, blogType: 'NEWS' } }),
      TUTORIAL: await prisma.blogPost.count({ where: { published: true, blogType: 'TUTORIAL' } })
    };

    return NextResponse.json({ posts, tags: allTags, typeCounts });
  } catch (error) {
    console.error('Blog list error:', error);
    return NextResponse.json({ posts: [], tags: [], typeCounts: {} });
  }
}
