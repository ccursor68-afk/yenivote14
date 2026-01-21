const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Hash password for both users
    const hashedPassword = await bcrypt.hash('123456', 12);
    console.log('✓ Password hashed');

    // 1. Create ADMIN user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'admin@test.com',
        password: hashedPassword,
        username: 'admin',
        role: 'ADMIN',
        minecraftNick: 'AdminPlayer',
        avatarUrl: 'https://mc-heads.net/avatar/AdminPlayer'
      }
    });
    console.log(`✓ Admin user created: ${adminUser.email}`);

    // 2. Create normal USER
    const normalUser = await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'user@test.com',
        password: hashedPassword,
        username: 'testuser',
        role: 'USER',
        minecraftNick: 'TestPlayer',
        avatarUrl: 'https://mc-heads.net/avatar/TestPlayer'
      }
    });
    console.log(`✓ Normal user created: ${normalUser.email}`);

    // 3. Create test server (owned by admin)
    const testServer = await prisma.server.upsert({
      where: { id: 'test-server-001' },
      update: {},
      create: {
        id: 'test-server-001',
        name: 'Test Minecraft Server',
        ip: 'play.testserver.com',
        port: 25565,
        platform: 'JAVA',
        version: '1.21',
        shortDescription: 'Otomatik eklenmiş test sunucu',
        longDescription: 'Bu sunucu seed işlemi sırasında otomatik olarak oluşturulmuştur. Survival, Creative ve Minigames modları mevcuttur.',
        tags: ['survival', 'creative', 'minigames', 'pvp'],
        approvalStatus: 'APPROVED',
        isOnline: true,
        playerCount: 42,
        maxPlayers: 100,
        voteCount: 150,
        monthlyVotes: 25,
        isSponsored: false,
        ownerId: adminUser.id,
        website: 'https://testserver.com',
        discord: 'https://discord.gg/testserver',
        bannerUrl: 'https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg',
        logoUrl: null
      }
    });
    console.log(`✓ Test server created: ${testServer.name}`);

    // 4. Create a second server (sponsored)
    const sponsoredServer = await prisma.server.upsert({
      where: { id: 'sponsored-server-001' },
      update: {},
      create: {
        id: 'sponsored-server-001',
        name: 'Premium Survival Server',
        ip: 'play.premiummc.net',
        port: 25565,
        platform: 'JAVA',
        version: '1.20.4',
        shortDescription: 'Premium survival deneyimi - Ekonomi, Clans, Events',
        longDescription: 'Premium Minecraft sunucusu. Özel ekonomi sistemi, klan savaşları, haftalık etkinlikler ve daha fazlası!',
        tags: ['survival', 'economy', 'clans', 'events', 'premium'],
        approvalStatus: 'APPROVED',
        isOnline: true,
        playerCount: 89,
        maxPlayers: 200,
        voteCount: 520,
        monthlyVotes: 78,
        isSponsored: true,
        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        ownerId: adminUser.id,
        website: 'https://premiummc.net',
        discord: 'https://discord.gg/premiummc'
      }
    });
    console.log(`✓ Sponsored server created: ${sponsoredServer.name}`);

    // 5. Create a blog category
    const newsCategory = await prisma.blogCategory.upsert({
      where: { slug: 'haberler' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Haberler',
        slug: 'haberler',
        description: 'Minecraft ve sunucu haberleri',
        color: '#10b981'
      }
    });
    console.log(`✓ Blog category created: ${newsCategory.name}`);

    // 6. Create a sample blog post
    const blogPost = await prisma.blogPost.upsert({
      where: { slug: 'hosgeldiniz' },
      update: {},
      create: {
        id: uuidv4(),
        title: 'ServerListRank\'a Hoşgeldiniz!',
        slug: 'hosgeldiniz',
        content: 'ServerListRank, Türkiye\'nin en iyi Minecraft sunucu listesi platformudur. Sunucunuzu ekleyin, oy toplayın ve topluluğunuzu büyütün!\n\n## Özellikler\n\n- NuVotifier desteği\n- Sponsorlu sunucu seçenekleri\n- Modern ve kullanıcı dostu arayüz\n- Discord entegrasyonu\n\nSunucunuzu hemen ekleyin ve binlerce oyuncuya ulaşın!',
        excerpt: 'ServerListRank platformuna hoşgeldiniz! Sunucunuzu ekleyin ve topluluğunuzu büyütün.',
        published: true,
        authorId: adminUser.id,
        categoryId: newsCategory.id,
        coverImage: 'https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg'
      }
    });
    console.log(`✓ Blog post created: ${blogPost.title}`);

    // 7. Create a sample banner
    const banner = await prisma.banner.upsert({
      where: { id: 'welcome-banner-001' },
      update: {},
      create: {
        id: 'welcome-banner-001',
        title: 'Sunucunuzu Öne Çıkarın!',
        subtitle: 'Sponsor olun, daha fazla oyuncuya ulaşın',
        imageUrl: 'https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg',
        linkUrl: '/sponsor',
        position: 'home_top',
        isActive: true,
        priority: 10
      }
    });
    console.log(`✓ Banner created: ${banner.title}`);

    console.log('');
    console.log('✅ Database seed completed successfully!');
    console.log('');
    console.log('📋 Created accounts:');
    console.log('   Admin: admin@test.com / 123456');
    console.log('   User:  user@test.com / 123456');
    console.log('');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
