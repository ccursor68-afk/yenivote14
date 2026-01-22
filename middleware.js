import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-32chars'
);

const COOKIE_NAME = 'auth_token';

// Routes that require authentication
const PROTECTED_ROUTES = ['/profile'];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

// Robust cookie parser
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  
  try {
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      
      if (key) {
        try {
          cookies[key] = decodeURIComponent(value);
        } catch {
          cookies[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Middleware cookie parse error:', error);
  }
  
  return cookies;
}

async function verifyAuth(request) {
  try {
    // Method 1: Try request.cookies (Next.js built-in)
    const cookieFromNextJs = request.cookies.get(COOKIE_NAME);
    if (cookieFromNextJs?.value) {
      const { payload } = await jwtVerify(cookieFromNextJs.value, JWT_SECRET);
      return payload;
    }
    
    // Method 2: Parse cookie header manually
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      const token = cookies[COOKIE_NAME];
      if (token) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Middleware auth error:', error.message);
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
        return NextResponse.redirect(new URL('/?login=true', request.url));
      }
      
      if (payload.role !== 'ADMIN') {
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
