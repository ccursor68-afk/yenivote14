import { NextResponse } from 'next/server';
import { isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    message: 'ServerListRank API',
    version: '1.0.0',
    database: isDatabaseAvailable() ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
}
