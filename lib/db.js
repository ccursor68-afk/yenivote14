// Build-safe Prisma client initialization
let prisma = null;

export function getPrisma() {
  if (prisma) return prisma;
  
  // Only initialize if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set - database operations will fail');
    return null;
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient();
    } else {
      // In development, use global to preserve connection across hot reloads
      if (!global.prisma) {
        global.prisma = new PrismaClient();
      }
      prisma = global.prisma;
    }
    
    return prisma;
  } catch (error) {
    console.error('Failed to initialize Prisma:', error.message);
    return null;
  }
}

export default getPrisma;
