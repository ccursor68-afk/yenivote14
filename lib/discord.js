// Discord OAuth Configuration

export const DISCORD_CONFIG = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`,
  scope: 'identify email',
  authUrl: 'https://discord.com/api/oauth2/authorize',
  tokenUrl: 'https://discord.com/api/oauth2/token',
  userUrl: 'https://discord.com/api/users/@me'
};

export function isDiscordConfigured() {
  return !!(DISCORD_CONFIG.clientId && DISCORD_CONFIG.clientSecret);
}

export function getDiscordAuthUrl(state) {
  if (!isDiscordConfigured()) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    redirect_uri: DISCORD_CONFIG.redirectUri,
    response_type: 'code',
    scope: DISCORD_CONFIG.scope,
    state: state || ''
  });

  return `${DISCORD_CONFIG.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const response = await fetch(DISCORD_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: DISCORD_CONFIG.clientId,
      client_secret: DISCORD_CONFIG.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_CONFIG.redirectUri
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code');
  }

  return response.json();
}

export async function getDiscordUser(accessToken) {
  const response = await fetch(DISCORD_CONFIG.userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get Discord user');
  }

  return response.json();
}

export function getDiscordAvatarUrl(user) {
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;
  }
  // Default avatar
  const defaultAvatar = parseInt(user.discriminator || '0') % 5;
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
}
