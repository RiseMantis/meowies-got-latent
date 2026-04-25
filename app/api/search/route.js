import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'No query' }, { status: 400 })
    }

    // 1. Search our local database first for Verified/Registered stores
    const localStores = await prisma.location.findMany({
      where: {
        isVerified: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 4
    });

    // 2. Fetch from Nominatim (OpenStreetMap)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4`,
      { headers: { 'User-Agent': 'WalksAndChill github.com/RiseMantis' } }
    )

    const results = await res.json();

    // 3. Upsert OSM results to DB to give them a valid ID
    const osmLocations = await Promise.all(
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

    // 4. Combine results: prioritize local registered stores, then append OSM results avoiding duplicates
    const combined = [...localStores];
    const localIds = new Set(localStores.map(store => store.id));

    osmLocations.forEach(loc => {
      if (!localIds.has(loc.id)) {
        combined.push(loc);
      }
    });

    return NextResponse.json(combined);

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}