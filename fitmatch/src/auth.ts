import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((e) => e.trim().toLowerCase());
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            isAdmin: adminEmails.includes(user.email.toLowerCase()),
          });
        }
        return true;
      } catch (err) {
        console.error('Error in signIn callback:', err);
        return true;
      }
    },
    async session({ session }) {
      if (session.user && session.user.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email }).lean();
          if (dbUser) {
            (session.user as any).id = (dbUser as any)._id.toString();
            (session.user as any).isAdmin = (dbUser as any).isAdmin || false;
            (session.user as any).hasSavedProfile = Boolean((dbUser as any).encryptedProfile?.data);
          }
        } catch (err) {
          console.error('Error in session callback:', err);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
});
