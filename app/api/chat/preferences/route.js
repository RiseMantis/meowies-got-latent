import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    
    // Fallback for development/testing if not logged in
    if (!userId) {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) {
        userId = fallbackUser.id;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: userId },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: userId },
      update: data,
      create: { userId: userId, ...data },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}