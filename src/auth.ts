import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { db } from "@/lib/db";
import { hasGoogleAuth } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);

      if (!parsed.success) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { email: parsed.data.email },
        include: { memberships: true },
      });

      if (!user?.passwordHash) {
        return null;
      }

      const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);

      if (!matches) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (hasGoogleAuth()) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub;

      if (!userId) {
        return token;
      }

      const currentUser = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          activeVenueId: true,
        },
      });

      if (currentUser) {
        token.sub = currentUser.id;
        token.activeVenueId = currentUser.activeVenueId;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.sub) {
        return session;
      }

      const currentUser = await db.user.findUnique({
        where: { id: token.sub },
        select: {
          id: true,
          activeVenueId: true,
        },
      });

      const membership = await db.membership.findFirst({
        where: {
          userId: token.sub,
          venueId: currentUser?.activeVenueId ?? undefined,
        },
      });

      if (session.user) {
        session.user.id = token.sub;
        session.user.activeVenueId = currentUser?.activeVenueId ?? null;
        session.user.role = membership?.role ?? null;
      }

      return session;
    },
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const existing = await db.user.findUnique({
        where: { email: user.email },
      });

      if (existing && !existing.activeVenueId) {
        const membership = await db.membership.findFirst({
          where: { userId: existing.id },
          orderBy: { createdAt: "asc" },
        });

        if (membership) {
          await db.user.update({
            where: { id: existing.id },
            data: { activeVenueId: membership.venueId },
          });
        }
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "local-dev-secret-change-me",
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
