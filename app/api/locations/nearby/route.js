import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
    }

    // 4 km radius ≈ 0.036 degrees latitude
    const delta = 0.036;

    // 1. Fetch registered locations from our database within 4km
    let dbLocations = [];
    try {
      dbLocations = await prisma.location.findMany({
        where: {
          lat: { gte: lat - delta, lte: lat + delta },
          lon: { gte: lon - delta, lte: lon + delta },
          isVerified: true
        },
        take: 7
      });
    } catch (err) {
      console.error('Nearby DB query failed, falling back to Overpass-only results:', err);
    }

    // 2. Fetch nearby prominent places from Overpass API (cafes, restaurants, parks, etc.)
    let osmPlaces = [];
    try {
      const radius = 4000; // 4km in meters
      const query = `
        [out:json][timeout:5];
        (
          node["amenity"~"cafe|restaurant|library|park"](around:${radius},${lat},${lon});
          node["leisure"~"park|garden"](around:${radius},${lat},${lon});
          node["tourism"~"museum|attraction|viewpoint"](around:${radius},${lat},${lon});
          node["shop"~"books|pet"](around:${radius},${lat},${lon});
        );
        out body 10;
      `;

      const osmRes = await fetch(
        'https://overpass-api.de/api/interpreter',
        {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' , 'User-Agent': 'WalksAndChill github.com/RiseMantis'}
        }
      );
      if (!osmRes.ok) {
        const errorBody = await osmRes.text();
        console.error(`Overpass API responded with ${osmRes.status}:`, errorBody);
        // Don't crash the whole route, just keep osmPlaces empty
      } else {
        const osmData = await osmRes.json();
        if (osmData.elements) {
          osmPlaces = osmData.elements
            .filter(el => el.tags && el.tags.name)
            .map(el => ({
              name: el.tags.name,
              address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || el.tags.name,
              lat: el.lat,
              lon: el.lon,
              placeId: `osm-${el.id}`,
              isOsm: true
            }));
        }
      }
    } catch (err) {
      console.error('Overpass nearby fetch error:', err);
    }

    // 3. Combine: DB locations first, then OSM, deduped, max 7
    const combined = [...dbLocations.map(l => ({ ...l, isRegistered: true }))];
    const usedCoords = new Set(dbLocations.map(l => `${l.lat.toFixed(3)},${l.lon.toFixed(3)}`));

    for (const osm of osmPlaces) {
      const key = `${osm.lat.toFixed(3)},${osm.lon.toFixed(3)}`;
      if (!usedCoords.has(key) && combined.length < 7) {
        combined.push(osm);
        usedCoords.add(key);
      }
    }

    return NextResponse.json(combined);

  } catch (error) {
    console.error('Nearby API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
