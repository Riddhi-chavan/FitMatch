import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { encrypt, decrypt } from '@/lib/crypto';
import { ProfileSchema } from '@/lib/validators';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.encryptedProfile || !user.encryptedProfile.data) {
      return NextResponse.json({
        profile: null,
        user: { name: user.name, email: user.email, image: user.image },
      });
    }

    try {
      const decrypted = decrypt({
        iv: user.encryptedProfile.iv,
        tag: user.encryptedProfile.tag,
        data: user.encryptedProfile.data,
      });

      return NextResponse.json({
        profile: decrypted,
        user: { name: user.name, email: user.email, image: user.image },
      });
    } catch (decryptErr) {
      console.error('Failed to decrypt user profile:', decryptErr);
      return NextResponse.json({
        profile: null,
        user: { name: user.name, email: user.email, image: user.image },
      });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const encrypted = encrypt(parsed.data);

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          encryptedProfile: encrypted,
          saveProfile: true,
          name: session.user.name || undefined,
          image: session.user.image || undefined,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, userId: user._id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $unset: { encryptedProfile: 1 },
        $set: { saveProfile: false },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
