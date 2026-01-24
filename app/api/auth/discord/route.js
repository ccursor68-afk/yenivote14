import { NextResponse } from 'next/server';
import { isDiscordConfigured, getDiscordAuthUrl } from '@/lib/discord';

export async function GET(request) {
  try {
    if (!isDiscordConfigured()) {
      return NextResponse.json({ 
        error: 'Discord OAuth yapılandırılmamış',
        message: 'DISCORD_CLIENT_ID ve DISCORD_CLIENT_SECRET ayarlanmalı' 
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get('returnUrl') || '/';
    
    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({ returnUrl, timestamp: Date.now() })).toString('base64');
    
    const authUrl = getDiscordAuthUrl(state);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    // Error logged
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
