import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ messages: [] });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: conversation.messages });

  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}