import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// GET /api/blog/[slug] - Get blog post by slug
export async function GET(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const { slug } = params;
    const prisma = getPrisma();

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { username: true, avatarUrl: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    if (!post || !post.published) {
      return NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
