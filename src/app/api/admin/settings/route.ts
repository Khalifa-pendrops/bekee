import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.getStoreSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.updateStoreSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('[API /api/admin/settings] Error:', err);
    return NextResponse.json({ error: 'Failed to update settings', message: err.message }, { status: 500 });
  }
}

