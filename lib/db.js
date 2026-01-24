// Build-safe Prisma client initialization
// PostgreSQL database connection

let prisma = null;

export function getPrisma() {
  // Return cached instance
  if (prisma) return prisma;
  
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    // Dynamic import to prevent build errors
    const { PrismaClient } = require('@prisma/client');
    
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient({
        log: ['error'],
      });
    } else {
      // In development, use global to preserve connection across hot reloads
      if (!global.__prisma) {
        global.__prisma = new PrismaClient({
          log: ['error'],
        });
      }
      prisma = global.__prisma;
    }
    
    return prisma;
  } catch (error) {
    return null;
  }
}

// Helper to check if database is available
export function isDatabaseAvailable() {
  return !!process.env.DATABASE_URL;
}

// Helper for API responses when DB is not available
export function dbNotAvailableResponse() {
  return {
    error: 'Database not configured',
    message: 'Please set DATABASE_URL environment variable',
    status: 503
  };
}

export default getPrisma;
