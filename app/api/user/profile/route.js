import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';
import { auth } from '@/auth';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email || `${session.user.name}@placeholder.com`;
    const name = session.user.name || "Unknown User";

    // Find or create the user in the database based on session
    const user = await prisma.user.upsert({
      where: { name: name },
      update: { email: email },
      create: {
        name: name,
        email: email
      },
      include: {
        registeredLocations: true,
        reports: {
          include: {
            location: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json({ user, sessionUser: session.user });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
