import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate Cron Caller (Vercel Cron or Authorization Bearer header)
    const authHeader = req.headers.get('authorization');
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const cronSecret = process.env.CRON_SECRET;

    const isAuthorized =
      isVercelCron ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (process.env.NODE_ENV !== 'production' && !cronSecret);

    if (!isAuthorized) {
      console.warn('[Cron /release-reservations] Unauthorized trigger attempt rejected.');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid CRON_SECRET or Vercel cron caller required.' },
        { status: 401 }
      );
    }

    const result = await db.releaseExpiredReservations();

    return NextResponse.json({
      success: true,
      releasedReservations: result.releasedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Cron /release-reservations] Error:', err);
    return NextResponse.json(
      { error: 'Failed to release expired reservations', message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

