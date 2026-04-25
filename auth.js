import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { prisma } from "./lib/prisma";

export const {auth, handlers, signIn, signOut} = NextAuth({
  providers: [
    Github(),
    Google(),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Fetch a valid user from the database to avoid foreign key errors in API routes
        let user = await prisma.user.findFirst();
        if (!user) {
          user = await prisma.user.create({
            data: { name: credentials.username || 'Test User', email: 'test@example.com' }
          });
        }
        return { id: user.id, name: user.name, email: user.email }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Ensure user exists in database for OAuth providers
      if (account?.provider !== 'credentials' && user.id) {
        try {
          // Upsert user by id to avoid unique constraint violations
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email || '',
              name: user.name || profile?.name || user.email?.split('@')[0] || 'User'
            },
            create: {
              id: user.id,
              email: user.email || '',
              name: user.name || profile?.name || user.email?.split('@')[0] || 'User'
            }
          });
        } catch (error) {
          console.error('Error creating/updating user in signIn:', error);
          // Don't block sign-in if user sync fails - the location register route has fallback logic
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
})
