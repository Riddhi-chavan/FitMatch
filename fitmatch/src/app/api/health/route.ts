import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'ok', message: 'MongoDB connected ✅' });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: String(err) },
      { status: 500 }
    );
  }
}

