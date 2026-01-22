const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Hash password
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
    console.log(`✓ Admin user: ${adminUser.email}`);

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
    console.log(`✓ Normal user: ${normalUser.email}`);

    // 3. Create test servers
    const servers = [
      { name: 'Survival Paradise', ip: 'play.survival.net', gameMode: 'SURVIVAL', voteCount: 520 },
      { name: 'SkyBlock Pro', ip: 'play.skyblock.net', gameMode: 'SKYBLOCK', voteCount: 450 },
      { name: 'Faction Wars', ip: 'play.faction.net', gameMode: 'FACTION', voteCount: 380 },
      { name: 'Towny Kingdom', ip: 'play.towny.net', gameMode: 'TOWNY', voteCount: 320 },
      { name: 'Prison Break', ip: 'play.prison.net', gameMode: 'PRISON', voteCount: 280 }
    ];

    for (const s of servers) {
      await prisma.server.upsert({
        where: { id: `server-${s.gameMode.toLowerCase()}` },
        update: {},
        create: {
          id: `server-${s.gameMode.toLowerCase()}`,
          name: s.name,
          ip: s.ip,
          port: 25565,
          platform: 'JAVA',
          gameMode: s.gameMode,
          version: '1.21',
          shortDescription: `${s.gameMode} modu sunucusu - Türkiye'nin en iyi sunucularından biri!`,
          tags: [s.gameMode.toLowerCase(), 'türkiye', 'pvp'],
          approvalStatus: 'APPROVED',
          isOnline: true,
          playerCount: Math.floor(Math.random() * 100) + 20,
          maxPlayers: 200,
          voteCount: s.voteCount,
          monthlyVotes: Math.floor(s.voteCount / 10),
          ownerId: adminUser.id
        }
      });
    }
    console.log('✓ Test servers created');

    // 4. Create sponsored server
    await prisma.server.upsert({
      where: { id: 'sponsored-server-main' },
      update: {},
      create: {
        id: 'sponsored-server-main',
        name: 'Premium MC Network',
        ip: 'play.premiummc.net',
        port: 25565,
        platform: 'JAVA',
        gameMode: 'SURVIVAL',
        version: '1.21',
        shortDescription: '🌟 Premium sunucu deneyimi - Özel ekonomi, clans ve events!',
        tags: ['premium', 'survival', 'economy'],
        approvalStatus: 'APPROVED',
        isOnline: true,
        playerCount: 156,
        maxPlayers: 500,
        voteCount: 1250,
        monthlyVotes: 180,
        isSponsored: true,
        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ownerId: adminUser.id
      }
    });
    console.log('✓ Sponsored server created');

    // 5. Create Hostings
    const hostings = [
      { name: 'TurkHost', website: 'https://turkhost.com', price: 49.90, perf: 4.8, sup: 4.5, val: 4.7 },
      { name: 'GameServer TR', website: 'https://gameserver.tr', price: 59.90, perf: 4.6, sup: 4.8, val: 4.3 },
      { name: 'MCHosting', website: 'https://mchosting.com.tr', price: 39.90, perf: 4.2, sup: 4.0, val: 4.9 }
    ];

    for (const h of hostings) {
      const slug = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await prisma.hosting.upsert({
        where: { slug },
        update: {},
        create: {
          id: uuidv4(),
          name: h.name,
          slug,
          website: h.website,
          description: `${h.name} - Profesyonel Minecraft hosting hizmeti`,
          features: ['DDoS Koruması', 'SSD Diskler', '7/24 Destek', 'Panel Erişimi'],
          startingPrice: h.price,
          approvalStatus: 'APPROVED',
          isActive: true,
          avgPerformance: h.perf,
          avgSupport: h.sup,
          avgPriceValue: h.val,
          avgOverall: (h.perf + h.sup + h.val) / 3,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          ownerId: adminUser.id
        }
      });
    }
    console.log('✓ Hostings created');

    // 6. Create sponsored hosting
    await prisma.hosting.upsert({
      where: { slug: 'premium-host' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Premium Host',
        slug: 'premium-host',
        website: 'https://premiumhost.com.tr',
        description: '🌟 Türkiye\'nin 1 numaralı Minecraft hosting firması',
        features: ['DDoS Koruması', 'SSD NVMe', '7/24 Canlı Destek', 'Otomatik Yedekleme', 'Mod Desteği'],
        startingPrice: 79.90,
        approvalStatus: 'APPROVED',
        isActive: true,
        isSponsored: true,
        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        avgPerformance: 4.9,
        avgSupport: 4.9,
        avgPriceValue: 4.5,
        avgOverall: 4.77,
        reviewCount: 128,
        ownerId: adminUser.id
      }
    });
    console.log('✓ Sponsored hosting created');

    // 7. Create Blog Category
    const newsCategory = await prisma.blogCategory.upsert({
      where: { slug: 'haberler' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Haberler',
        slug: 'haberler',
        description: 'Minecraft haberleri',
        color: '#10b981'
      }
    });

    const guideCategory = await prisma.blogCategory.upsert({
      where: { slug: 'rehberler' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Rehberler',
        slug: 'rehberler',
        description: 'Minecraft rehberleri',
        color: '#3b82f6'
      }
    });
    console.log('✓ Blog categories created');

    // 8. Create Blog Posts
    await prisma.blogPost.upsert({
      where: { slug: 'hosgeldiniz' },
      update: { published: true },
      create: {
        id: uuidv4(),
        title: 'ServerListRank\'a Hoşgeldiniz!',
        slug: 'hosgeldiniz',
        content: 'ServerListRank, Türkiye\'nin en kapsamlı Minecraft sunucu listesi platformudur.\n\n## Özellikler\n\n- NuVotifier desteği\n- Sponsorlu sunucu seçenekleri\n- Modern ve kullanıcı dostu arayüz\n- Hosting karşılaştırma\n\nSunucunuzu hemen ekleyin!',
        excerpt: 'Türkiye\'nin en iyi Minecraft sunucu listesi',
        tags: ['duyuru', 'yeni', 'minecraft'],
        published: true,
        authorId: adminUser.id,
        categoryId: newsCategory.id
      }
    });

    await prisma.blogPost.upsert({
      where: { slug: 'sunucu-nasil-eklenir' },
      update: { published: true },
      create: {
        id: uuidv4(),
        title: 'Sunucu Nasıl Eklenir?',
        slug: 'sunucu-nasil-eklenir',
        content: 'Bu rehberde sunucunuzu nasıl ekleyeceğinizi öğreneceksiniz.\n\n## Adımlar\n\n1. Hesap oluşturun\n2. Sunucu Ekle sayfasına gidin\n3. Bilgileri doldurun\n4. Onay bekleyin',
        excerpt: 'Sunucu ekleme rehberi',
        tags: ['rehber', 'sunucu', 'başlangıç'],
        published: true,
        authorId: adminUser.id,
        categoryId: guideCategory.id
      }
    });
    console.log('✓ Blog posts created');

    // 9. Create Banners
    await prisma.banner.upsert({
      where: { id: 'banner-header' },
      update: {},
      create: {
        id: 'banner-header',
        title: 'Sunucunuzu Öne Çıkarın!',
        subtitle: 'Sponsor olun, daha fazla oyuncuya ulaşın',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=300&fit=crop',
        linkUrl: '/fiyatlandirma',
        position: 'home_top',
        isActive: true,
        priority: 10
      }
    });

    await prisma.banner.upsert({
      where: { id: 'banner-sidebar' },
      update: {},
      create: {
        id: 'banner-sidebar',
        title: 'Reklam Alanı',
        subtitle: 'Buraya reklam verebilirsiniz',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop',
        linkUrl: '/fiyatlandirma',
        position: 'home_sidebar',
        isActive: true,
        priority: 5
      }
    });
    console.log('✓ Banners created');

    // 10. Create Pricing Packages
    const packages = [
      { name: 'Header Reklam', slug: 'header-reklam', price: 100, type: 'HEADER_AD', desc: 'Ana sayfa üst banner', features: ['1 aylık gösterim', 'Tüm sayfalarda görünür', 'Yüksek tıklama oranı'] },
      { name: 'Sidebar Reklam', slug: 'sidebar-reklam', price: 75, type: 'SIDEBAR_AD', desc: 'Yan panel reklamı', features: ['1 aylık gösterim', 'Ana sayfada görünür', 'Dikkat çekici konum'] },
      { name: 'Sunucu Sponsorluğu', slug: 'sunucu-sponsor', price: 200, type: 'SERVER_SPONSOR', desc: 'Sunucunuz öne çıksın', features: ['1 aylık sponsorluk', 'Listenin en üstünde', 'Özel rozet'] },
      { name: 'Hosting Sponsorluğu', slug: 'hosting-sponsor', price: 250, type: 'HOSTING_SPONSOR', desc: 'Hosting firmanız öne çıksın', features: ['1 aylık sponsorluk', 'Hosting listesinde 1 numara', 'Özel etiket'] }
    ];

    for (let i = 0; i < packages.length; i++) {
      const p = packages[i];
      await prisma.pricingPackage.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          id: uuidv4(),
          name: p.name,
          slug: p.slug,
          description: p.desc,
          price: p.price,
          packageType: p.type,
          features: p.features,
          sortOrder: i,
          isActive: true
        }
      });
    }
    console.log('✓ Pricing packages created');

    // 11. Create Site Settings
    await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        discordUrl: 'https://discord.gg/serverlistrank',
        instagramUrl: 'https://instagram.com/serverlistrank',
        youtubeUrl: 'https://youtube.com/@serverlistrank',
        twitterUrl: 'https://twitter.com/serverlistrank',
        contactEmail: 'info@serverlistrank.com'
      }
    });
    console.log('✓ Site settings created');

    console.log('');
    console.log('✅ Database seed completed!');
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
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
