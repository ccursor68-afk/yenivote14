import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// GET /api/blog - List published blog posts
export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        author: {
          select: { username: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Blog list error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
