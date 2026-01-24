import { NextResponse } from 'next/server';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 });
    }

    const prisma = getPrisma();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, role: user.role });
    
    // Pass request to detect HTTPS
    const cookieOptions = setAuthCookie(token, request);

    const response = NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        minecraftNick: user.minecraftNick,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      message: 'Giriş başarılı' 
    });
    
    // Set cookie with proper options - CRITICAL FIX
    response.cookies.set(cookieOptions.name, cookieOptions.value, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
