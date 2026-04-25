import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@/auth';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ── Tool definitions for Gemini function-calling ──────────────────────
const tools = [
  {
    functionDeclarations: [
      {
        name: 'search_places',
        description:
          'Search for places by name or keyword using OpenStreetMap Nominatim. Returns matching locations with coordinates.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'Search query – a place name, type, or keyword (e.g. "quiet cafe in Mumbai", "library near Andheri")',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'find_nearby_places',
        description:
          'Find nearby points of interest (cafés, parks, libraries, restaurants, gardens, museums, bookshops, pet shops) around a given latitude/longitude using OpenStreetMap Overpass.',
        parameters: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              description: 'Latitude of the centre point',
            },
            lon: {
              type: 'number',
              description: 'Longitude of the centre point',
            },
            radius: {
              type: 'number',
              description:
                'Search radius in metres (default 3000)',
            },
          },
          required: ['lat', 'lon'],
        },
      },
      {
        name: 'get_db_locations',
        description:
          'Retrieve registered / reviewed locations from the Walks-and-Chill database. These locations have community sensory ratings (sound, light, aroma, crowd each on a 1-5 scale). Use this when the user asks about reviewed or rated places.',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Max locations to return (default 20)',
            },
          },
        },
      },
    ],
  },
];

// ── Tool implementations ──────────────────────────────────────────────

async function executeSearchPlaces(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
      { headers: { 'User-Agent': 'WalksAndChill github.com/RiseMantis' } }
    );
    if (!res.ok) return { error: `Nominatim returned ${res.status}` };
    const results = await res.json();
    return results.map((r) => ({
      name: r.display_name.split(',')[0],
      fullAddress: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      type: r.type,
      category: r.class,
    }));
  } catch (err) {
    return { error: err.message };
  }
}

async function executeFindNearbyPlaces(lat, lon, radius = 3000) {
  try {
    const query = `
      [out:json][timeout:8];
      (
        node["amenity"~"cafe|restaurant|library|park|community_centre"](around:${radius},${lat},${lon});
        node["leisure"~"park|garden|playground"](around:${radius},${lat},${lon});
        node["tourism"~"museum|attraction|viewpoint"](around:${radius},${lat},${lon});
        node["shop"~"books|pet"](around:${radius},${lat},${lon});
      );
      out body 12;
    `;
    const osmRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'WalksAndChill github.com/RiseMantis',
      },
    });
    if (!osmRes.ok) return { error: `Overpass returned ${osmRes.status}` };
    const data = await osmRes.json();
    return (data.elements || [])
      .filter((el) => el.tags && el.tags.name)
      .map((el) => ({
        name: el.tags.name,
        address:
          [el.tags['addr:street'], el.tags['addr:city']]
            .filter(Boolean)
            .join(', ') || 'Address not available',
        lat: el.lat,
        lon: el.lon,
        type: el.tags.amenity || el.tags.leisure || el.tags.tourism || el.tags.shop || 'place',
        cuisine: el.tags.cuisine || undefined,
        openingHours: el.tags.opening_hours || undefined,
      }));
  } catch (err) {
    return { error: err.message };
  }
}

async function executeGetDbLocations(limit = 20) {
  try {
    const locations = await prisma.location.findMany({
      take: limit,
      include: {
        reports: {
          select: { soundTag: true, lightTag: true, aromaTag: true, crowdTag: true },
        },
      },
    });
    return locations.map((loc) => {
      const avg = (field) => {
        if (loc[field]) return loc[field];
        if (!loc.reports.length) return null;
        return +(loc.reports.reduce((s, r) => s + r[field], 0) / loc.reports.length).toFixed(1);
      };
      return {
        name: loc.name,
        address: loc.address,
        lat: loc.lat,
        lon: loc.lon,
        isVerified: loc.isVerified,
        soundRating: avg('soundTag'),
        lightRating: avg('lightTag'),
        aromaRating: avg('aromaTag'),
        crowdRating: avg('crowdTag'),
        totalReviews: loc.reports.length,
      };
    });
  } catch (err) {
    return { error: err.message };
  }
}

async function handleFunctionCall(call) {
  const args = call.args || {};
  switch (call.name) {
    case 'search_places':
      return await executeSearchPlaces(args.query);
    case 'find_nearby_places':
      return await executeFindNearbyPlaces(args.lat, args.lon, args.radius);
    case 'get_db_locations':
      return await executeGetDbLocations(args.limit);
    default:
      return { error: `Unknown function: ${call.name}` };
  }
}

// ── Main POST handler ─────────────────────────────────────────────────
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
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } },
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: { userId: userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
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

    // System prompt – the AI now uses tools instead of a static list
    const systemPrompt = `You are Meow 🐾, a friendly and enthusiastic location recommendation assistant for "Walks and Chill" – an app that helps people find calm, sensory-friendly places.

Your personality:
- Warm, playful, occasionally uses cat puns
- Empathetic – you understand sensory sensitivities and moods
- Concise but helpful

Sensory rating scale (used in the database):
- soundTag: 1-5 (1 = very quiet, 5 = very loud)
- lightTag: 1-5 (1 = very dim, 5 = very bright)
- aromaTag: 1-5 (1 = no aroma, 5 = strong aroma)
- crowdTag: 1-5 (1 = empty, 5 = very crowded)

User preferences: ${
      preferences
        ? JSON.stringify({
            sound: preferences.preferredSoundLevel,
            light: preferences.preferredLighting,
            aroma: preferences.preferredAroma,
            crowd: preferences.preferredCrowd,
            mood: preferences.mood,
          })
        : 'None set yet'
    }

How to help users:
1. When a user asks for a place recommendation, ALWAYS use your tools to search for real places. Use search_places for text queries or find_nearby_places if you have coordinates.
2. You can also check get_db_locations to see if any community-reviewed places exist.
3. Analyze the user's mood and sensory needs from their message.
4. Present results in a friendly, organized way with location names and addresses.
5. If the user mentions a city or area, search for places there.
6. If no specific area is mentioned, ask the user for their city or location so you can search.
7. Never say your database is empty – you can always search for new places!

Keep responses concise, warm, and actionable.`;

    // Prepare messages for Gemini
    const chatMessages = conversation.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));

    chatMessages.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Create response stream with function-calling loop
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let assistantMessage = '';

        try {
          // We may need multiple round-trips if the model calls functions
          let currentMessages = [...chatMessages];
          let maxIterations = 5; // safety cap

          while (maxIterations-- > 0) {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: currentMessages,
              config: {
                systemInstruction: systemPrompt,
                tools: tools,
              },
            });

            const candidate = response.candidates?.[0];
            if (!candidate) break;

            const parts = candidate.content?.parts || [];

            // Check if there are function calls
            const functionCalls = parts.filter((p) => p.functionCall);
            const textParts = parts.filter((p) => p.text);

            // Stream any text parts immediately
            for (const part of textParts) {
              if (part.text) {
                assistantMessage += part.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: part.text })}\n\n`)
                );
              }
            }

            // If there are function calls, execute them and continue the loop
            if (functionCalls.length > 0) {
              // Add the model's response (with function calls) to the conversation
              currentMessages.push({
                role: 'model',
                parts: parts,
              });

              // Execute each function call and add results
              const functionResponses = [];
              for (const fc of functionCalls) {
                const result = await handleFunctionCall(fc.functionCall);
                functionResponses.push({
                  functionResponse: {
                    name: fc.functionCall.name,
                    response: { result: result },
                  },
                });
              }

              currentMessages.push({
                role: 'user',
                parts: functionResponses,
              });

              // Continue the loop – the model will now generate text using the function results
              continue;
            }

            // No more function calls → we're done
            break;
          }

          // Save assistant message
          if (assistantMessage) {
            await prisma.conversationMessage.create({
              data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: assistantMessage,
              },
            });
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          // Send error message to the client so it doesn't hang
          const errText = "Apologies, I ran into a little hiccup! 🐱 Could you try again?";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: errText })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}