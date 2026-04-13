import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'No query' }, { status: 400 })  // fix: dot not comma
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4`,
      { headers: { 'User-Agent': 'WalksAndChill github.com/RiseMantis' } }
    )

    const results = await res.json();

    if (!results.length) {
      return NextResponse.json([])  // fix: dot not comma
    }

    const locations = await Promise.all(
      results.map(async (r) => {
        return prisma.location.upsert({
          where: { placeId: r.place_id.toString() },
          update: {},
          create: {
            name: r.display_name.split(',')[0],
            address: r.display_name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            placeId: r.place_id.toString()
          }
        })
      })
    )

    return NextResponse.json(locations)

  } catch (error) {
    console.error('Search API error:', error)  // this will show the real error in your terminal
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}