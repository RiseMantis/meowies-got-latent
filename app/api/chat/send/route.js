import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@/auth';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
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

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: userId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } }
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: { userId: userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    // Save user message
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Get user preferences
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: userId },
    });

    // Get recent locations for context
    const recentLocations = await prisma.location.findMany({
      take: 20,
      include: {
        reports: {
          select: {
            soundTag: true,
            lightTag: true,
            aromaTag: true,
            crowdTag: true,
          },
        },
      },
    });

    // Prepare messages for Gemini
    const messages = conversation.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{text: msg.content}],
    }));

    messages.push({
      role: 'user',
      parts: [{text: message}],
    });

    // System prompt
    const systemPrompt = `You are Meow, a friendly location recommendation assistant for "Walks and Chill" - an app that helps users find places based on sensory preferences and mood.

You have access to a database of locations with sensory ratings:
- soundTag: 1-5 (1=very quiet, 5=very loud)
- lightTag: 1-5 (1=very dark, 5=very bright)
- aromaTag: 1-5 (1=no aroma, 5=strong aroma)
- crowdTag: 1-5 (1=empty, 5=very crowded)

User preferences: ${preferences ? JSON.stringify({
  sound: preferences.preferredSoundLevel,
  light: preferences.preferredLighting,
  aroma: preferences.preferredAroma,
  crowd: preferences.preferredCrowd,
  mood: preferences.mood,
}) : 'None set'}

Available locations: ${JSON.stringify(recentLocations.map(loc => ({
  id: loc.id,
  name: loc.name,
  address: loc.address,
  soundTag: loc.soundTag || loc.reports.reduce((sum, r) => sum + r.soundTag, 0) / loc.reports.length || 3,
  lightTag: loc.lightTag || loc.reports.reduce((sum, r) => sum + r.lightTag, 0) / loc.reports.length || 3,
  aromaTag: loc.aromaTag || loc.reports.reduce((sum, r) => sum + r.aromaTag, 0) / loc.reports.length || 3,
  crowdTag: loc.crowdTag || loc.reports.reduce((sum, r) => sum + r.crowdTag, 0) / loc.reports.length || 3,
})))}

When recommending places:
1. Analyze the user's message for mood, preferences, or sensory needs
2. Match locations based on sensory tags
3. Be conversational and helpful
4. If no perfect matches, suggest closest alternatives
5. Format recommendations clearly with location details

Keep responses concise but friendly.`;

    // Call Gemini
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    // Create response stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let assistantMessage = '';

        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              assistantMessage += chunk.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`));
            }
          }

          // Save assistant message
          await prisma.conversationMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'assistant',
              content: assistantMessage,
            },
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}