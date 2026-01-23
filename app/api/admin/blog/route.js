import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function requireAdmin(request) {
  if (!isDatabaseAvailable()) return null;
  
  const prisma = getPrisma();
  const user = await getAuthUser(request, prisma);
  
  if (!user) {
    console.log('Admin check: No user found');
    return null;
  }
  
  if (user.role !== 'ADMIN') {
    console.log('Admin check: User is not admin, role:', user.role);
    return null;
  }
  
  console.log('Admin check: User is admin:', user.email);
  return user;
}

// GET /api/admin/blog - Get all blog posts (admin)
export async function GET(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const prisma = getPrisma();
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true } },
        category: { select: { id: true, name: true, slug: true } }
      }
    });

    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ posts, categories });
  } catch (error) {
    console.error('Admin blog list error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/blog - Create blog post
export async function POST(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, excerpt, coverImage, tags, published, categoryId, blogType } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Başlık ve içerik gerekli' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[ç]/g, 'c')
      .replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i')
      .replace(/[ü]/g, 'u')
      .replace(/[ö]/g, 'o')
      .replace(/[ğ]/g, 'g')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const prisma = getPrisma();

    const post = await prisma.blogPost.create({
      data: {
        id: uuidv4(),
        title,
        slug: `${slug}-${Date.now()}`,
        content,
        excerpt,
        coverImage,
        tags: tags || [],
        published: published || false,
        blogType: blogType || 'NEWS',
        authorId: admin.id,
        categoryId: categoryId || null
      }
    });

    return NextResponse.json({ post, message: 'Blog yazısı oluşturuldu' });
  } catch (error) {
    console.error('Admin blog create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// PUT /api/admin/blog - Update blog post
export async function PUT(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, content, excerpt, coverImage, tags, published, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = tags;
    if (published !== undefined) updateData.published = published;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ post, message: 'Blog yazısı güncellendi' });
  } catch (error) {
    console.error('Admin blog update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/blog - Delete blog post
export async function DELETE(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ message: 'Yazı silindi' });
  } catch (error) {
    console.error('Admin blog delete error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
