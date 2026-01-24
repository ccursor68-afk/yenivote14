import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { checkAndAwardBadges } from '@/lib/badges';

// POST /api/hostings/[id]/review - Add review to hosting
export async function POST(request, { params }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const prisma = getPrisma();
    const user = await getAuthUser(request, prisma);
    
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id: hostingId } = params;
    const body = await request.json();
    const { performance, support, priceValue, comment } = body;

    // Validate ratings (1-5)
    if (!performance || !support || !priceValue) {
      return NextResponse.json({ error: 'Tüm puanlar gerekli' }, { status: 400 });
    }

    const clamp = (val) => Math.min(5, Math.max(1, parseInt(val)));

    // Check if user already reviewed
    const existingReview = await prisma.hostingReview.findUnique({
      where: { hostingId_userId: { hostingId, userId: user.id } }
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.hostingReview.update({
        where: { id: existingReview.id },
        data: {
          performance: clamp(performance),
          support: clamp(support),
          priceValue: clamp(priceValue),
          comment
        }
      });
    } else {
      // Create new review
      review = await prisma.hostingReview.create({
        data: {
          id: uuidv4(),
          hostingId,
          userId: user.id,
          performance: clamp(performance),
          support: clamp(support),
          priceValue: clamp(priceValue),
          comment
        }
      });
    }

    // Recalculate hosting averages
    const allReviews = await prisma.hostingReview.findMany({
      where: { hostingId }
    });

    const avgPerformance = allReviews.reduce((sum, r) => sum + r.performance, 0) / allReviews.length;
    const avgSupport = allReviews.reduce((sum, r) => sum + r.support, 0) / allReviews.length;
    const avgPriceValue = allReviews.reduce((sum, r) => sum + r.priceValue, 0) / allReviews.length;
    const avgOverall = (avgPerformance + avgSupport + avgPriceValue) / 3;

    await prisma.hosting.update({
      where: { id: hostingId },
      data: {
        avgPerformance,
        avgSupport,
        avgPriceValue,
        avgOverall,
        reviewCount: allReviews.length
      }
    });

    // Check and award badges (CRITIC badge for 3+ reviews)
    const newBadges = await checkAndAwardBadges(prisma, user.id);

    return NextResponse.json({ 
      review, 
      message: 'Değerlendirme kaydedildi',
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
