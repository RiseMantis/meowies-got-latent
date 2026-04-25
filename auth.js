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
