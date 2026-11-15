import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Brand from '@/lib/models/Brand';

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({ active: true }).select('name slug logo').lean();
    return NextResponse.json(brands);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

