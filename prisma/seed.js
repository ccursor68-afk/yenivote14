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
      update: { role: 'ADMIN' },
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
    console.log(`✓ Admin user created/updated: ${adminUser.email} (role: ${adminUser.role})`);

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
        gameMode: 'SURVIVAL',
        version: '1.21',
        shortDescription: 'Otomatik eklenmiş test sunucu',
        longDescription: 'Bu sunucu seed işlemi sırasında otomatik olarak oluşturulmuştur.',
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
        discord: 'https://discord.gg/testserver'
      }
    });
    console.log(`✓ Test server created: ${testServer.name}`);

    // 4. Create a second server (sponsored, Skyblock)
    const sponsoredServer = await prisma.server.upsert({
      where: { id: 'sponsored-server-001' },
      update: {},
      create: {
        id: 'sponsored-server-001',
        name: 'Premium Skyblock Server',
        ip: 'play.premiummc.net',
        port: 25565,
        platform: 'JAVA',
        gameMode: 'SKYBLOCK',
        version: '1.20.4',
        shortDescription: 'Premium skyblock deneyimi - Ekonomi, Islands, Events',
        longDescription: 'Premium Minecraft sunucusu.',
        tags: ['skyblock', 'economy', 'islands', 'events', 'premium'],
        approvalStatus: 'APPROVED',
        isOnline: true,
        playerCount: 89,
        maxPlayers: 200,
        voteCount: 520,
        monthlyVotes: 78,
        isSponsored: true,
        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ownerId: adminUser.id,
        website: 'https://premiummc.net',
        discord: 'https://discord.gg/premiummc'
      }
    });
    console.log(`✓ Sponsored server created: ${sponsoredServer.name}`);

    // 5. Create more servers with different game modes
    const gameModes = ['FACTION', 'TOWNY', 'PRISON', 'KITPVP', 'MINIGAMES'];
    for (let i = 0; i < gameModes.length; i++) {
      const mode = gameModes[i];
      await prisma.server.upsert({
        where: { id: `gamemode-server-${i}` },
        update: {},
        create: {
          id: `gamemode-server-${i}`,
          name: `${mode} Server`,
          ip: `play.${mode.toLowerCase()}.net`,
          port: 25565,
          platform: 'JAVA',
          gameMode: mode,
          version: '1.20.4',
          shortDescription: `${mode} modu sunucusu`,
          tags: [mode.toLowerCase()],
          approvalStatus: 'APPROVED',
          isOnline: true,
          playerCount: Math.floor(Math.random() * 100),
          maxPlayers: 100,
          voteCount: Math.floor(Math.random() * 500),
          monthlyVotes: Math.floor(Math.random() * 50),
          ownerId: adminUser.id
        }
      });
    }
    console.log('✓ Game mode servers created');

    // 6. Create a blog category
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

    // 7. Create a sample blog post
    const blogPost = await prisma.blogPost.upsert({
      where: { slug: 'hosgeldiniz' },
      update: {},
      create: {
        id: uuidv4(),
        title: 'ServerListRank\'a Hoşgeldiniz!',
        slug: 'hosgeldiniz',
        content: 'ServerListRank, Türkiye\'nin en iyi Minecraft sunucu listesi platformudur.',
        excerpt: 'ServerListRank platformuna hoşgeldiniz!',
        published: true,
        authorId: adminUser.id,
        categoryId: newsCategory.id
      }
    });
    console.log(`✓ Blog post created: ${blogPost.title}`);

    // 8. Create banners
    const banners = [
      {
        id: 'banner-home-top-001',
        title: 'Sunucunuzu Öne Çıkarın!',
        subtitle: 'Sponsor olun, daha fazla oyuncuya ulaşın',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=300&fit=crop',
        linkUrl: '/sponsor',
        position: 'home_top',
        isActive: true,
        priority: 10
      },
      {
        id: 'banner-list-001',
        title: 'Yeni Sunucular Keşfedin',
        subtitle: 'Her gün yeni sunucular ekleniyor',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=200&fit=crop',
        linkUrl: '/servers',
        position: 'list_between',
        isActive: true,
        priority: 5
      }
    ];

    for (const banner of banners) {
      await prisma.banner.upsert({
        where: { id: banner.id },
        update: {},
        create: banner
      });
    }
    console.log('✓ Banners created');

    console.log('');
    console.log('✅ Database seed completed successfully!');
    console.log('');
    console.log('📋 Test accounts:');
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
