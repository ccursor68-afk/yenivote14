import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { hashPassword, verifyPassword, createToken, verifyToken, getTokenFromRequest, setAuthCookie } from '@/lib/auth';
import { sendVotifierVote } from '@/lib/votifier';

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Helper to get client IP
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || '127.0.0.1';
}

// Helper to get authenticated user
async function getAuthUser(request) {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  const prisma = getPrisma();
  if (!prisma) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        minecraftNick: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Admin check middleware
async function requireAdmin(request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Main route handler
async function handleRoute(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    // =====================
    // PUBLIC ROUTES
    // =====================

    // Health check
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: 'ServerListRank API',
        version: '1.0.0',
        database: isDatabaseAvailable() ? 'configured' : 'not configured'
      }));
    }

    // =====================
    // AUTH ROUTES
    // =====================

    // Register
    if (route === '/auth/register' && method === 'POST') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const body = await request.json();
      const { email, password, username } = body;

      if (!email || !password) {
        return handleCORS(NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 }));
      }

      const prisma = getPrisma();
      
      // Check existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(username ? [{ username }] : [])
          ]
        }
      });

      if (existingUser) {
        return handleCORS(NextResponse.json({ error: 'Bu email veya kullanıcı adı zaten kayıtlı' }, { status: 400 }));
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email,
          password: hashedPassword,
          username: username || null,
          role: 'USER'
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        }
      });

      const token = await createToken({ userId: user.id, role: user.role });
      const cookie = setAuthCookie(token);

      const response = NextResponse.json({ user, message: 'Kayıt başarılı' });
      response.cookies.set(cookie.name, cookie.value, cookie);
      
      return handleCORS(response);
    }

    // Login
    if (route === '/auth/login' && method === 'POST') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return handleCORS(NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 }));
      }

      const prisma = getPrisma();
      
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        return handleCORS(NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 }));
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return handleCORS(NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 }));
      }

      const token = await createToken({ userId: user.id, role: user.role });
      const cookie = setAuthCookie(token);

      const response = NextResponse.json({ 
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          minecraftNick: user.minecraftNick,
          role: user.role,
          avatarUrl: user.avatarUrl
        },
        message: 'Giriş başarılı' 
      });
      response.cookies.set(cookie.name, cookie.value, cookie);
      
      return handleCORS(response);
    }

    // Logout
    if (route === '/auth/logout' && method === 'POST') {
      const response = NextResponse.json({ message: 'Çıkış yapıldı' });
      response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
      return handleCORS(response);
    }

    // Get current user
    if (route === '/auth/me' && method === 'GET') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ user: null }));
      }
      return handleCORS(NextResponse.json({ user }));
    }

    // Update profile
    if (route === '/auth/profile' && method === 'PUT') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const body = await request.json();
      const { username, minecraftNick } = body;

      const prisma = getPrisma();
      
      // Check username uniqueness
      if (username && username !== user.username) {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
          return handleCORS(NextResponse.json({ error: 'Bu kullanıcı adı kullanılıyor' }, { status: 400 }));
        }
      }

      const avatarUrl = minecraftNick ? `https://mc-heads.net/avatar/${minecraftNick}` : user.avatarUrl;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: username || user.username,
          minecraftNick: minecraftNick || user.minecraftNick,
          avatarUrl
        },
        select: {
          id: true,
          email: true,
          username: true,
          minecraftNick: true,
          role: true,
          avatarUrl: true
        }
      });

      return handleCORS(NextResponse.json({ user: updatedUser }));
    }

    // =====================
    // SERVER ROUTES
    // =====================

    // List servers (public)
    if (route === '/servers' && method === 'GET') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const { searchParams } = new URL(request.url);
      const platform = searchParams.get('platform');
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');

      const prisma = getPrisma();

      const where = {
        approvalStatus: 'APPROVED',
        ...(platform && { platform }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { shortDescription: { contains: search } },
            { tags: { contains: search } }
          ]
        })
      };

      const [servers, total] = await Promise.all([
        prisma.server.findMany({
          where,
          orderBy: [
            { isSponsored: 'desc' },
            { voteCount: 'desc' }
          ],
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            ip: true,
            port: true,
            platform: true,
            version: true,
            shortDescription: true,
            tags: true,
            bannerUrl: true,
            logoUrl: true,
            isOnline: true,
            playerCount: true,
            maxPlayers: true,
            voteCount: true,
            monthlyVotes: true,
            isSponsored: true,
            featuredUntil: true,
            createdAt: true
          }
        }),
        prisma.server.count({ where })
      ]);

      // Parse tags from JSON string
      const serversWithParsedTags = servers.map(s => ({
        ...s,
        tags: s.tags ? JSON.parse(s.tags) : []
      }));

      return handleCORS(NextResponse.json({ 
        servers: serversWithParsedTags, 
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }));
    }

    // Get single server
    if (route.match(/^\/servers\/[^/]+$/) && method === 'GET') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const serverId = path[1];
      const prisma = getPrisma();

      const server = await prisma.server.findUnique({
        where: { id: serverId },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              minecraftNick: true,
              avatarUrl: true
            }
          }
        }
      });

      if (!server) {
        return handleCORS(NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 }));
      }

      // Hide votifier credentials from public
      const { votifierPublicKey, votifierToken, ...publicServer } = server;
      const hasVotifier = !!(server.votifierHost && server.votifierPort && server.votifierPublicKey);

      return handleCORS(NextResponse.json({ 
        server: { ...publicServer, hasVotifier } 
      }));
    }

    // Create server
    if (route === '/servers' && method === 'POST') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const body = await request.json();
      const { 
        name, ip, port, platform, version, website, discord,
        bannerUrl, logoUrl, shortDescription, longDescription, tags,
        votifierHost, votifierPort, votifierPublicKey, votifierToken
      } = body;

      if (!name || !ip || !shortDescription || !version) {
        return handleCORS(NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 }));
      }

      const prisma = getPrisma();

      const server = await prisma.server.create({
        data: {
          id: uuidv4(),
          name,
          ip,
          port: port || 25565,
          platform: platform || 'JAVA',
          version,
          website,
          discord,
          bannerUrl,
          logoUrl,
          shortDescription,
          longDescription,
          tags: JSON.stringify(tags || []),
          votifierHost,
          votifierPort,
          votifierPublicKey,
          votifierToken,
          approvalStatus: 'PENDING',
          ownerId: user.id
        }
      });

      return handleCORS(NextResponse.json({ server, message: 'Sunucu eklendi, onay bekleniyor' }));
    }

    // Update server
    if (route.match(/^\/servers\/[^/]+$/) && method === 'PUT') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const serverId = path[1];
      const prisma = getPrisma();

      const server = await prisma.server.findUnique({ where: { id: serverId } });
      if (!server) {
        return handleCORS(NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 }));
      }

      if (server.ownerId !== user.id && user.role !== 'ADMIN') {
        return handleCORS(NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 }));
      }

      const body = await request.json();
      const allowedFields = [
        'name', 'ip', 'port', 'platform', 'version', 'website', 'discord',
        'bannerUrl', 'logoUrl', 'shortDescription', 'longDescription', 'tags',
        'votifierHost', 'votifierPort', 'votifierPublicKey', 'votifierToken'
      ];

      const updateData = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      const updatedServer = await prisma.server.update({
        where: { id: serverId },
        data: updateData
      });

      return handleCORS(NextResponse.json({ server: updatedServer }));
    }

    // Delete server
    if (route.match(/^\/servers\/[^/]+$/) && method === 'DELETE') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const serverId = path[1];
      const prisma = getPrisma();

      const server = await prisma.server.findUnique({ where: { id: serverId } });
      if (!server) {
        return handleCORS(NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 }));
      }

      if (server.ownerId !== user.id && user.role !== 'ADMIN') {
        return handleCORS(NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 }));
      }

      await prisma.server.delete({ where: { id: serverId } });

      return handleCORS(NextResponse.json({ message: 'Sunucu silindi' }));
    }

    // My servers
    if (route === '/servers/my' && method === 'GET') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const prisma = getPrisma();
      const servers = await prisma.server.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      return handleCORS(NextResponse.json({ servers }));
    }

    // =====================
    // VOTE ROUTES
    // =====================

    // Vote for server
    if (route.match(/^\/servers\/[^/]+\/vote$/) && method === 'POST') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const serverId = path[1];
      const body = await request.json();
      const { minecraftUsername } = body;

      if (!minecraftUsername || minecraftUsername.length < 3 || minecraftUsername.length > 16) {
        return handleCORS(NextResponse.json({ error: 'Geçerli bir Minecraft kullanıcı adı girin (3-16 karakter)' }, { status: 400 }));
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(minecraftUsername)) {
        return handleCORS(NextResponse.json({ error: 'Minecraft kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir' }, { status: 400 }));
      }

      const clientIP = getClientIP(request);
      const prisma = getPrisma();

      // Get server
      const server = await prisma.server.findUnique({ where: { id: serverId } });
      if (!server) {
        return handleCORS(NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 }));
      }

      if (server.approvalStatus !== 'APPROVED') {
        return handleCORS(NextResponse.json({ error: 'Bu sunucu henüz onaylanmamış' }, { status: 400 }));
      }

      // Check 24-hour cooldown
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Check IP cooldown
      const existingIPVote = await prisma.vote.findFirst({
        where: {
          serverId,
          ipAddress: clientIP,
          createdAt: { gte: twentyFourHoursAgo }
        }
      });

      if (existingIPVote) {
        const nextVoteTime = new Date(existingIPVote.createdAt.getTime() + 24 * 60 * 60 * 1000);
        return handleCORS(NextResponse.json({ 
          error: 'Bu IP adresinden son 24 saat içinde oy verilmiş',
          nextVoteTime 
        }, { status: 429 }));
      }

      // Check username cooldown
      const existingUsernameVote = await prisma.vote.findFirst({
        where: {
          serverId,
          minecraftUsername: minecraftUsername.toLowerCase(),
          createdAt: { gte: twentyFourHoursAgo }
        }
      });

      if (existingUsernameVote) {
        const nextVoteTime = new Date(existingUsernameVote.createdAt.getTime() + 24 * 60 * 60 * 1000);
        return handleCORS(NextResponse.json({ 
          error: 'Bu kullanıcı adı ile son 24 saat içinde oy verilmiş',
          nextVoteTime 
        }, { status: 429 }));
      }

      // Send vote to NuVotifier if configured
      let votifierResult = null;
      if (server.votifierHost && server.votifierPort && server.votifierPublicKey) {
        try {
          votifierResult = await sendVotifierVote(server, minecraftUsername, clientIP);
        } catch (err) {
          console.error('Votifier error:', err);
          // Continue even if votifier fails - record vote anyway
          votifierResult = { success: false, error: err.message };
        }
      }

      // Record vote
      const vote = await prisma.vote.create({
        data: {
          id: uuidv4(),
          serverId,
          minecraftUsername: minecraftUsername.toLowerCase(),
          ipAddress: clientIP
        }
      });

      // Update server vote count
      await prisma.server.update({
        where: { id: serverId },
        data: {
          voteCount: { increment: 1 },
          monthlyVotes: { increment: 1 }
        }
      });

      return handleCORS(NextResponse.json({ 
        message: 'Oy başarıyla kaydedildi!',
        vote,
        votifier: votifierResult
      }));
    }

    // Check vote status
    if (route.match(/^\/servers\/[^/]+\/vote-status$/) && method === 'GET') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const serverId = path[1];
      const { searchParams } = new URL(request.url);
      const minecraftUsername = searchParams.get('username');
      
      const clientIP = getClientIP(request);
      const prisma = getPrisma();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const ipVote = await prisma.vote.findFirst({
        where: {
          serverId,
          ipAddress: clientIP,
          createdAt: { gte: twentyFourHoursAgo }
        }
      });

      let usernameVote = null;
      if (minecraftUsername) {
        usernameVote = await prisma.vote.findFirst({
          where: {
            serverId,
            minecraftUsername: minecraftUsername.toLowerCase(),
            createdAt: { gte: twentyFourHoursAgo }
          }
        });
      }

      const canVote = !ipVote && !usernameVote;
      const nextVoteTime = ipVote 
        ? new Date(ipVote.createdAt.getTime() + 24 * 60 * 60 * 1000)
        : usernameVote 
          ? new Date(usernameVote.createdAt.getTime() + 24 * 60 * 60 * 1000)
          : null;

      return handleCORS(NextResponse.json({ canVote, nextVoteTime }));
    }

    // =====================
    // ADMIN ROUTES
    // =====================

    // Admin: Get pending servers
    if (route === '/admin/servers/pending' && method === 'GET') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const prisma = getPrisma();
      const servers = await prisma.server.findMany({
        where: { approvalStatus: 'PENDING' },
        include: {
          owner: {
            select: { id: true, email: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return handleCORS(NextResponse.json({ servers }));
    }

    // Admin: Approve/Reject server
    if (route.match(/^\/admin\/servers\/[^/]+\/status$/) && method === 'PUT') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const serverId = path[2];
      const body = await request.json();
      const { status } = body; // 'APPROVED' or 'REJECTED'

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return handleCORS(NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 }));
      }

      const prisma = getPrisma();
      const server = await prisma.server.update({
        where: { id: serverId },
        data: { approvalStatus: status }
      });

      return handleCORS(NextResponse.json({ server, message: `Sunucu ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}` }));
    }

    // Admin: Set sponsor
    if (route.match(/^\/admin\/servers\/[^/]+\/sponsor$/) && method === 'PUT') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const serverId = path[2];
      const body = await request.json();
      const { days } = body; // Number of days to sponsor

      const prisma = getPrisma();
      
      const featuredUntil = days > 0 
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        : null;

      const server = await prisma.server.update({
        where: { id: serverId },
        data: { 
          isSponsored: days > 0,
          featuredUntil
        }
      });

      return handleCORS(NextResponse.json({ server }));
    }

    // Admin: Get all users
    if (route === '/admin/users' && method === 'GET') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const prisma = getPrisma();
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          minecraftNick: true,
          role: true,
          createdAt: true,
          _count: {
            select: { servers: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return handleCORS(NextResponse.json({ users }));
    }

    // Admin: Get stats
    if (route === '/admin/stats' && method === 'GET') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const prisma = getPrisma();
      
      const [userCount, serverCount, voteCount, pendingCount] = await Promise.all([
        prisma.user.count(),
        prisma.server.count({ where: { approvalStatus: 'APPROVED' } }),
        prisma.vote.count(),
        prisma.server.count({ where: { approvalStatus: 'PENDING' } })
      ]);

      return handleCORS(NextResponse.json({ 
        stats: { userCount, serverCount, voteCount, pendingCount }
      }));
    }

    // =====================
    // BLOG ROUTES
    // =====================

    // List blog posts (public)
    if (route === '/blog' && method === 'GET') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
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
          }
        }
      });

      return handleCORS(NextResponse.json({ posts }));
    }

    // Get blog post by slug
    if (route.match(/^\/blog\/[^/]+$/) && method === 'GET') {
      if (!isDatabaseAvailable()) {
        return handleCORS(NextResponse.json(dbNotAvailableResponse(), { status: 503 }));
      }

      const slug = path[1];
      const prisma = getPrisma();

      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          author: {
            select: { username: true, avatarUrl: true }
          }
        }
      });

      if (!post || !post.published) {
        return handleCORS(NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 }));
      }

      return handleCORS(NextResponse.json({ post }));
    }

    // Admin: Create blog post
    if (route === '/admin/blog' && method === 'POST') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const body = await request.json();
      const { title, content, excerpt, coverImage, published } = body;

      if (!title || !content) {
        return handleCORS(NextResponse.json({ error: 'Başlık ve içerik gerekli' }, { status: 400 }));
      }

      const slug = title
        .toLowerCase()
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
          published: published || false,
          authorId: admin.id
        }
      });

      return handleCORS(NextResponse.json({ post }));
    }

    // =====================
    // TICKET ROUTES
    // =====================

    // Create ticket
    if (route === '/tickets' && method === 'POST') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const body = await request.json();
      const { subject, message } = body;

      if (!subject || !message) {
        return handleCORS(NextResponse.json({ error: 'Konu ve mesaj gerekli' }, { status: 400 }));
      }

      const prisma = getPrisma();

      const ticket = await prisma.ticket.create({
        data: {
          id: uuidv4(),
          subject,
          userId: user.id,
          messages: {
            create: {
              id: uuidv4(),
              content: message,
              userId: user.id,
              isAdmin: false
            }
          }
        },
        include: { messages: true }
      });

      return handleCORS(NextResponse.json({ ticket }));
    }

    // My tickets
    if (route === '/tickets' && method === 'GET') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const prisma = getPrisma();
      const tickets = await prisma.ticket.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return handleCORS(NextResponse.json({ tickets }));
    }

    // Get ticket
    if (route.match(/^\/tickets\/[^/]+$/) && method === 'GET') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const ticketId = path[1];
      const prisma = getPrisma();

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: { username: true, avatarUrl: true, role: true }
              }
            }
          }
        }
      });

      if (!ticket) {
        return handleCORS(NextResponse.json({ error: 'Ticket bulunamadı' }, { status: 404 }));
      }

      if (ticket.userId !== user.id && user.role !== 'ADMIN') {
        return handleCORS(NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 }));
      }

      return handleCORS(NextResponse.json({ ticket }));
    }

    // Add message to ticket
    if (route.match(/^\/tickets\/[^/]+\/messages$/) && method === 'POST') {
      const user = await getAuthUser(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 }));
      }

      const ticketId = path[1];
      const body = await request.json();
      const { content } = body;

      if (!content) {
        return handleCORS(NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 }));
      }

      const prisma = getPrisma();

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return handleCORS(NextResponse.json({ error: 'Ticket bulunamadı' }, { status: 404 }));
      }

      if (ticket.userId !== user.id && user.role !== 'ADMIN') {
        return handleCORS(NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 }));
      }

      const message = await prisma.ticketMessage.create({
        data: {
          id: uuidv4(),
          content,
          ticketId,
          userId: user.id,
          isAdmin: user.role === 'ADMIN'
        }
      });

      // Update ticket status if admin responds
      if (user.role === 'ADMIN' && ticket.status === 'OPEN') {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: 'IN_PROGRESS' }
        });
      }

      return handleCORS(NextResponse.json({ message }));
    }

    // Admin: Get all tickets
    if (route === '/admin/tickets' && method === 'GET') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const prisma = getPrisma();
      const tickets = await prisma.ticket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return handleCORS(NextResponse.json({ tickets }));
    }

    // Admin: Close ticket
    if (route.match(/^\/admin\/tickets\/[^/]+\/close$/) && method === 'PUT') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }));
      }

      const ticketId = path[2];
      const prisma = getPrisma();

      const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'CLOSED' }
      });

      return handleCORS(NextResponse.json({ ticket }));
    }

    // Route not found
    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 }));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
