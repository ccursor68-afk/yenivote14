// Badge System Logic
// Handles badge assignment and checking

import { v4 as uuidv4 } from 'uuid';

// Badge requirements
export const BADGE_REQUIREMENTS = {
  CRITIC: {
    description: 'Eleştirmen - 3 veya daha fazla hosting değerlendirmesi yapıldığında',
    requirement: 3,
    checkField: 'reviewCount'
  },
  EXPLORER: {
    description: 'Kaşif - 2 veya daha fazla farklı sunucu ziyaret edildiğinde',
    requirement: 2,
    checkField: 'visitCount'
  },
  VERIFIED_OWNER: {
    description: 'Onaylı Sunucu Sahibi - Onaylanmış bir sunucu veya hosting sahibi',
    requirement: 1,
    checkField: 'approvedCount'
  },
  EARLY_ADOPTER: {
    description: 'Erken Kullanıcı - İlk 100 kullanıcı arasında',
    requirement: 100,
    checkField: 'userRank'
  },
  TOP_VOTER: {
    description: 'Oy Ustası - 10 veya daha fazla oy verdi',
    requirement: 10,
    checkField: 'voteCount'
  }
};

// Badge display info
export const BADGE_INFO = {
  CRITIC: {
    name: 'Eleştirmen',
    icon: '⭐',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  EXPLORER: {
    name: 'Kaşif',
    icon: '🌍',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  VERIFIED_OWNER: {
    name: 'Onaylı Sahip',
    icon: '✓',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  EARLY_ADOPTER: {
    name: 'Öncü',
    icon: '🚀',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  TOP_VOTER: {
    name: 'Oy Ustası',
    icon: '🗳️',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }
};

// Check and award badges for a user
export async function checkAndAwardBadges(prisma, userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        hostingReviews: true,
        serverVisits: true,
        servers: { where: { approvalStatus: 'APPROVED' } },
        hostings: { where: { approvalStatus: 'APPROVED' } }
      }
    });

    if (!user) return [];

    const existingBadges = user.badges.map(b => b.badgeType);
    const newBadges = [];

    // Check CRITIC badge (3+ reviews)
    if (!existingBadges.includes('CRITIC') && user.hostingReviews.length >= 3) {
      await prisma.userBadge.create({
        data: {
          id: uuidv4(),
          userId,
          badgeType: 'CRITIC'
        }
      });
      newBadges.push('CRITIC');
    }

    // Check EXPLORER badge (2+ server visits)
    if (!existingBadges.includes('EXPLORER') && user.serverVisits.length >= 2) {
      await prisma.userBadge.create({
        data: {
          id: uuidv4(),
          userId,
          badgeType: 'EXPLORER'
        }
      });
      newBadges.push('EXPLORER');
    }

    // Check VERIFIED_OWNER badge (has approved server or hosting)
    if (!existingBadges.includes('VERIFIED_OWNER') && 
        (user.servers.length > 0 || user.hostings.length > 0)) {
      await prisma.userBadge.create({
        data: {
          id: uuidv4(),
          userId,
          badgeType: 'VERIFIED_OWNER'
        }
      });
      newBadges.push('VERIFIED_OWNER');
    }

    return newBadges;
  } catch (error) {
    console.error('Badge check error:', error);
    return [];
  }
}

// Track server visit
export async function trackServerVisit(prisma, userId, serverId) {
  try {
    // Check if already visited
    const existing = await prisma.serverVisit.findUnique({
      where: {
        userId_serverId: { userId, serverId }
      }
    });

    if (!existing) {
      await prisma.serverVisit.create({
        data: {
          id: uuidv4(),
          userId,
          serverId
        }
      });
    }

    // Check for Explorer badge
    await checkAndAwardBadges(prisma, userId);
    
    return true;
  } catch (error) {
    console.error('Track visit error:', error);
    return false;
  }
}

export default { checkAndAwardBadges, trackServerVisit, BADGE_INFO, BADGE_REQUIREMENTS };
