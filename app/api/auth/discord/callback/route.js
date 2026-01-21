import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getPrisma, { isDatabaseAvailable } from '@/lib/db';
import { createToken, setAuthCookie } from '@/lib/auth';
import { isDiscordConfigured, exchangeCodeForToken, getDiscordUser, getDiscordAvatarUrl } from '@/lib/discord';

export async function GET(request) {
  try {
    if (!isDiscordConfigured()) {
      return NextResponse.redirect(new URL('/?error=discord_not_configured', request.url));
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.redirect(new URL('/?error=database_not_available', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Discord OAuth error:', error);
      return NextResponse.redirect(new URL('/?error=discord_denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Parse state
    let returnUrl = '/';
    try {
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        returnUrl = stateData.returnUrl || '/';
      }
    } catch (e) {
      console.warn('Invalid state:', e);
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code);
    
    // Get Discord user info
    const discordUser = await getDiscordUser(tokenData.access_token);
    
    if (!discordUser.email) {
      return NextResponse.redirect(new URL('/?error=email_required', request.url));
    }

    const prisma = getPrisma();
    
    // Check if user exists with this Discord ID
    let user = await prisma.user.findUnique({
      where: { discordId: discordUser.id }
    });

    if (!user) {
      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: discordUser.email }
      });

      if (existingEmail) {
        // Link Discord to existing account
        user = await prisma.user.update({
          where: { id: existingEmail.id },
          data: {
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            avatarUrl: getDiscordAvatarUrl(discordUser)
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: discordUser.email,
            username: discordUser.username,
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            avatarUrl: getDiscordAvatarUrl(discordUser),
            role: 'USER'
          }
        });
      }
    } else {
      // Update existing user's Discord info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          discordUsername: discordUser.username,
          avatarUrl: getDiscordAvatarUrl(discordUser)
        }
      });
    }

    // Create JWT token
    const token = await createToken({ userId: user.id, role: user.role });
    const cookie = setAuthCookie(token);

    // Redirect with cookie
    const response = NextResponse.redirect(new URL(returnUrl, request.url));
    response.cookies.set(cookie.name, cookie.value, cookie);
    
    return response;
  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.redirect(new URL('/?error=discord_error', request.url));
  }
}
