import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-32chars'
);

// Routes that require authentication
const PROTECTED_ROUTES = ['/profile'];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

async function verifyAuth(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const [key, ...val] = c.split('=');
      return [key, val.join('=')];
    })
  );
  
  const token = cookies['auth_token'];
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check admin routes
  for (const route of ADMIN_ROUTES) {
    if (pathname.startsWith(route)) {
      const payload = await verifyAuth(request);
      
      if (!payload) {
        // Redirect to login
        return NextResponse.redirect(new URL('/?login=true', request.url));
      }
      
      if (payload.role !== 'ADMIN') {
        // Redirect to home with error
        return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
      }
      
      return NextResponse.next();
    }
  }
  
  // Check protected routes
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route)) {
      const payload = await verifyAuth(request);
      
      if (!payload) {
        // Redirect to login
        return NextResponse.redirect(new URL('/?login=true', request.url));
      }
      
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*'
  ]
};
