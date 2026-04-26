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
    const id = session.user.id;

    if (!id) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    // Find or create the user in the database based on session
    const user = await prisma.user.upsert({
      where: { id: id },
      update: { name: name, email: email },
      create: {
        id: id,
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
