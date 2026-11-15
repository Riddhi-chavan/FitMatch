import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FitFeedback from '@/lib/models/FitFeedback';
import { FeedbackSchema } from '@/lib/validators';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { productId, sizeBought, result } = parsed.data;

    // Optional profile hash (privacy: never store raw measurements in feedback)
    let profileHash: string | undefined = undefined;
    if (body.profile) {
      profileHash = createHash('sha256')
        .update(JSON.stringify(body.profile))
        .digest('hex');
    }

    const feedback = await FitFeedback.create({
      productId,
      sizeBought,
      result,
      profileHash,
    });

    return NextResponse.json({ status: 'ok', id: feedback._id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
