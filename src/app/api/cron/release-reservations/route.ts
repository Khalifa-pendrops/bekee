import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
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

