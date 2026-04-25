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
    let localStores = [];
    let searchDbAvailable = true;

    try {
      localStores = await prisma.location.findMany({
        where: {
          isVerified: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 4
      });
    } catch (err) {
      searchDbAvailable = false;
      console.error('Search DB query failed, falling back to OSM-only results:', err);
    }

    // 2. Fetch from Nominatim (OpenStreetMap)
    let results = [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4`,
        { headers: { 'User-Agent': 'WalksAndChill github.com/RiseMantis' } }
      );
      if (res.ok) {
        results = await res.json();
      } else {
        console.error('Nominatim search responded with', res.status);
      }
    } catch (err) {
      console.error('Search OSM fetch failed, returning local results if available:', err);
    }

    // 3. Upsert OSM results to DB to give them a valid ID when the DB is available
    const osmLocations = await Promise.all(
      results.map(async (r) => {
        const osmLocation = {
          name: r.display_name.split(',')[0],
          address: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          placeId: r.place_id.toString()
        };

        if (!searchDbAvailable) {
          return osmLocation;
        }

        try {
          return await prisma.location.upsert({
            where: { placeId: r.place_id.toString() },
            update: {},
            create: osmLocation
          });
        } catch (upsertErr) {
          console.error('Search DB upsert failed, returning OSM item without DB persist:', upsertErr);
          return osmLocation;
        }
      })
    );

    // 4. Combine results: prioritize local registered stores, then append OSM results avoiding duplicates
    const combined = [...localStores];
    const localPlaceIds = new Set(localStores.map(store => store.placeId));

    osmLocations.forEach(loc => {
      if (!localPlaceIds.has(loc.placeId)) {
        combined.push(loc);
      }
    });

    return NextResponse.json(combined);

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}