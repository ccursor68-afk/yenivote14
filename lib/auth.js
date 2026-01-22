import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-32chars'
);

const COOKIE_NAME = 'auth_token';

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Create JWT token with user data
export async function createToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return token;
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// Check if request is over HTTPS
function isSecureRequest(request) {
  // Check X-Forwarded-Proto header (set by Nginx/proxy)
  const forwardedProto = request?.headers?.get?.('x-forwarded-proto');
  if (forwardedProto === 'https') return true;
  
  // Check if URL starts with https
  const url = request?.url || '';
  if (url.startsWith('https://')) return true;
  
  // Default to false for development/HTTP
  return false;
}

// Set auth cookie configuration - VPS/Proxy compatible
export function setAuthCookie(token, request = null) {
  // Determine if we should use secure flag
  // Only use secure:true if actually on HTTPS
  const isSecure = request ? isSecureRequest(request) : false;
  
  // For development, always use lax and non-secure
  const isDev = process.env.NODE_ENV !== 'production';
  
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isDev ? false : isSecure, // Never secure in dev
    sameSite: 'lax', // Lax is most compatible
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  };
}

// Clear auth cookie
export function clearAuthCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  };
}

// Parse cookies from header string - ROBUST VERSION
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;
  
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
        // Decode URI component if needed
        try {
          cookies[key] = decodeURIComponent(value);
        } catch {
          cookies[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Cookie parsing error:', error);
  }
  
  return cookies;
}

// Get token from request - ROBUST VERSION with debugging
export async function getTokenFromRequest(request) {
  try {
    // Method 1: Try Next.js cookies() - most reliable in App Router
    if (request.cookies) {
      const cookieStore = request.cookies;
      const tokenCookie = cookieStore.get?.(COOKIE_NAME);
      if (tokenCookie?.value) {
        console.log('Token found via request.cookies');
        return tokenCookie.value;
      }
    }
    
    // Method 2: Try cookie header
    const cookieHeader = request.headers?.get?.('cookie');
    if (cookieHeader) {
      console.log('Cookie header present, parsing...');
      const cookies = parseCookies(cookieHeader);
      if (cookies[COOKIE_NAME]) {
        console.log('Token found in cookie header');
        return cookies[COOKIE_NAME];
      }
    }
    
    // Method 3: Try Authorization header
    const authHeader = request.headers?.get?.('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      console.log('Token found in Authorization header');
      return authHeader.substring(7);
    }
    
    console.log('No token found in request');
    return null;
  } catch (error) {
    console.error('Error getting token from request:', error);
    return null;
  }
}

// Get authenticated user from request
export async function getAuthUser(request, prisma) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return null;
    }
    
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      console.log('Invalid token payload');
      return null;
    }
    
    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        minecraftNick: true,
        role: true,
        avatarUrl: true
      }
    });
    
    if (!user) {
      console.log('User not found in database');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}
