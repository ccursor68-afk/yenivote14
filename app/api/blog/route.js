import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// Force dynamic - no caching for blog posts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blog - List published blog posts
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ posts: [], tags: [], typeCounts: {} }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const category = searchParams.get('category');
    const blogType = searchParams.get('type');

    const prisma = getPrisma();
    
    const where = {
      published: true,
      ...(tag && { tags: { has: tag } }),
      ...(category && { category: { slug: category } }),
      ...(blogType && { blogType: blogType.toUpperCase() })
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
        blogType: true,
        published: true,
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

    // Get blog type counts
    const typeCounts = {
      GUIDE: await prisma.blogPost.count({ where: { published: true, blogType: 'GUIDE' } }),
      UPDATE: await prisma.blogPost.count({ where: { published: true, blogType: 'UPDATE' } }),
      NEWS: await prisma.blogPost.count({ where: { published: true, blogType: 'NEWS' } }),
      TUTORIAL: await prisma.blogPost.count({ where: { published: true, blogType: 'TUTORIAL' } })
    };

    return NextResponse.json({ posts, tags: allTags, typeCounts }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    return NextResponse.json({ posts: [], tags: [], typeCounts: {} }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}
