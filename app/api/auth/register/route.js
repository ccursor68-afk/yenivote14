import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable, dbNotAvailableResponse } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(dbNotAvailableResponse(), { status: 503 });
    }

    const body = await request.json();
    const { email, password, username, recaptchaToken } = body;

    // reCAPTCHA verification
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success && !recaptchaResult.skipped) {
      return NextResponse.json({ 
        error: recaptchaResult.message || 'Lütfen robot olmadığınızı doğrulayın',
        errorCode: recaptchaResult.error
      }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 });
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
      return NextResponse.json({ error: 'Bu email veya kullanıcı adı zaten kayıtlı' }, { status: 400 });
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
    const cookieOptions = setAuthCookie(token, request);

    const response = NextResponse.json({ user, message: 'Kayıt başarılı' });
    
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
