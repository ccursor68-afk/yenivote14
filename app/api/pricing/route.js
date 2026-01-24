import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';

// GET /api/pricing - Get pricing packages
export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ packages: [] });
    }

    const prisma = getPrisma();
    const packages = await prisma.pricingPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ packages });
  } catch (error) {
    // Error logged
    return NextResponse.json({ packages: [] });
  }
}
