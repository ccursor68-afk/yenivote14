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

// Check if request is over HTTPS - more robust detection
function isSecureRequest(request) {
  // Check X-Forwarded-Proto header (set by Nginx/proxy)
  const forwardedProto = request?.headers?.get?.('x-forwarded-proto');
  if (forwardedProto === 'https') return true;
  
  // Check X-Forwarded-SSL header
  const forwardedSSL = request?.headers?.get?.('x-forwarded-ssl');
  if (forwardedSSL === 'on') return true;
  
  // Check if URL starts with https
  const url = request?.url || '';
  if (url.startsWith('https://')) return true;
  
  // Check NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  if (baseUrl.startsWith('https://')) return true;
  
  return false;
}

// Get domain from request or env
function getDomain(request) {
  // Try to get domain from NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      return url.hostname;
    } catch {}
  }
  
  // Try to get from host header
  const host = request?.headers?.get?.('host');
  if (host) {
    return host.split(':')[0]; // Remove port if present
  }
  
  return undefined; // Let browser use current domain
}

// Set auth cookie configuration - VPS/Proxy compatible - FIXED
export function setAuthCookie(token, request = null) {
  const isSecure = isSecureRequest(request);
  const domain = getDomain(request);
  
  const cookieConfig = {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  };
  
  // Only set domain if we have a valid one (not localhost)
  if (domain && !domain.includes('localhost') && !domain.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    // Don't set domain for IP addresses or localhost
    // This allows the cookie to work on the exact domain
  }
  
  console.log('Cookie config:', { 
    secure: cookieConfig.secure, 
    sameSite: cookieConfig.sameSite,
    path: cookieConfig.path,
    maxAge: cookieConfig.maxAge,
    domain: domain || 'auto'
  });
  
  return cookieConfig;
}

// Clear auth cookie - MUST match set cookie config exactly
export function clearAuthCookie(request = null) {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    expires: new Date(0)
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

// Get token from request - ROBUST VERSION
export async function getTokenFromRequest(request) {
  try {
    // Method 1: Try Next.js cookies() - most reliable in App Router
    if (request.cookies) {
      const cookieStore = request.cookies;
      const tokenCookie = cookieStore.get?.(COOKIE_NAME);
      if (tokenCookie?.value) {
        return tokenCookie.value;
      }
    }
    
    // Method 2: Try cookie header
    const cookieHeader = request.headers?.get?.('cookie');
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      if (cookies[COOKIE_NAME]) {
        return cookies[COOKIE_NAME];
      }
    }
    
    // Method 3: Try Authorization header
    const authHeader = request.headers?.get?.('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
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
        avatarUrl: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}
