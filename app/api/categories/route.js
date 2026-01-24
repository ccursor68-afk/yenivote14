import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';

// GET /api/categories - Get blog categories (public)
export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ categories: [] });
    }

    const prisma = getPrisma();
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        _count: { select: { posts: { where: { published: true } } } }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    // Error logged
    return NextResponse.json({ categories: [] });
  }
}
