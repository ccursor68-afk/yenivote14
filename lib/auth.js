import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-32chars'
);

const COOKIE_NAME = 'auth_token';

// Trust host configuration - set to true when behind a proxy like Nginx
const TRUST_HOST = process.env.TRUST_HOST === 'true' || process.env.NODE_ENV === 'production';

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
    return null;
  }
}

// Check if request is over HTTPS - ENHANCED for Nginx/proxy compatibility
function isSecureRequest(request) {
  // 1. Check X-Forwarded-Proto header (most common, set by Nginx/proxy)
  const forwardedProto = request?.headers?.get?.('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.toLowerCase().includes('https');
  }
  
  // 2. Check X-Forwarded-SSL header (alternative)
  const forwardedSSL = request?.headers?.get?.('x-forwarded-ssl');
  if (forwardedSSL === 'on') return true;
  
  // 3. Check X-Forwarded-Scheme header (another alternative)
  const forwardedScheme = request?.headers?.get?.('x-forwarded-scheme');
  if (forwardedScheme === 'https') return true;
  
  // 4. Check CF-Visitor header (Cloudflare)
  const cfVisitor = request?.headers?.get?.('cf-visitor');
  if (cfVisitor) {
    try {
      const visitor = JSON.parse(cfVisitor);
      if (visitor.scheme === 'https') return true;
    } catch {}
  }
  
  // 5. Check Front-End-Https header (Microsoft)
  const frontEndHttps = request?.headers?.get?.('front-end-https');
  if (frontEndHttps === 'on') return true;
  
  // 6. Check if URL starts with https
  const url = request?.url || '';
  if (url.startsWith('https://')) return true;
  
  // 7. Check NEXT_PUBLIC_BASE_URL environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  if (baseUrl.startsWith('https://')) return true;
  
  // 8. Check NEXTAUTH_URL for consistency (if set)
  const nextAuthUrl = process.env.NEXTAUTH_URL || '';
  if (nextAuthUrl.startsWith('https://')) return true;
  
  return false;
}

// Get domain from request or env - ENHANCED
function getDomain(request) {
  // 1. Try to get domain from NEXT_PUBLIC_BASE_URL (most reliable)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      return url.hostname;
    } catch {}
  }
  
  // 2. Try NEXTAUTH_URL
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    try {
      const url = new URL(nextAuthUrl);
      return url.hostname;
    } catch {}
  }
  
  // 3. Try to get from X-Forwarded-Host header (proxy)
  const forwardedHost = request?.headers?.get?.('x-forwarded-host');
  if (forwardedHost) {
    return forwardedHost.split(':')[0];
  }
  
  // 4. Try to get from Host header
  const host = request?.headers?.get?.('host');
  if (host) {
    return host.split(':')[0]; // Remove port if present
  }
  
  return undefined; // Let browser use current domain
}

// Set auth cookie configuration - PROXY COMPATIBLE (Nginx/Cloudflare/etc)
export function setAuthCookie(token, request = null) {
  const isSecure = isSecureRequest(request);
  const domain = getDomain(request);
  
  // Determine if we should set secure based on protocol
  // CRITICAL: If using HTTPS, secure MUST be true; if HTTP, secure MUST be false
  const shouldBeSecure = isSecure;
  
  const cookieConfig = {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: shouldBeSecure,
    sameSite: 'lax', // 'lax' allows cookies on navigation, 'strict' is too restrictive
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  };
  
  // Log for debugging (remove in production if too noisy)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] Cookie config:', {
      domain,
      isSecure: shouldBeSecure,
      sameSite: cookieConfig.sameSite,
      trustHost: TRUST_HOST
    });
  }
  
  // Note: We intentionally DON'T set the domain attribute
  // When domain is not set, the cookie is restricted to the exact host
  // This is more secure and works better with subdomains
  
  return cookieConfig;
}

// Clear auth cookie - MUST match set cookie config exactly
export function clearAuthCookie(request = null) {
  const isSecure = isSecureRequest(request);
  
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecure,
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
    return null;
  }
}
