import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request) {
  const response = NextResponse.json({ message: 'Çıkış yapıldı' });
  // Pass request to detect HTTPS correctly (important for proxy setups)
  const cookieOptions = clearAuthCookie(request);
  response.cookies.set(cookieOptions.name, cookieOptions.value, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    maxAge: cookieOptions.maxAge,
    path: cookieOptions.path
  });
  return response;
}
