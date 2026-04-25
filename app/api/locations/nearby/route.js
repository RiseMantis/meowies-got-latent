import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));
    const filters = searchParams.get('filters')
      ? searchParams.get('filters').split(',').map((f) => f.trim().toLowerCase()).filter(Boolean)
      : [];

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
    }

    const filterFieldMap = {
      quiet: 'soundTag',
      aroma: 'aromaTag',
      crowd: 'crowdTag',
      lighting: 'lightTag'
    };

    const filterConditions = filters
      .map((filter) => {
        const field = filterFieldMap[filter];
        if (!field) return null;
        return { reports: { some: { [field]: { gte: 4 } } } };
      })
      .filter(Boolean);

    const radius = filters.length ? 10000 : 4000;
    const delta = radius / 111000;

    // 1. DB locations
    let dbLocations = [];
    try {
      dbLocations = await prisma.location.findMany({
        where: {
          lat: { gte: lat - delta, lte: lat + delta },
          lon: { gte: lon - delta, lte: lon + delta },
          // isVerified: true,
          ...(filterConditions.length ? { AND: filterConditions } : {})
        },
        take: 7,
        select: {
          id: true,
          name: true,
          address: true,
          lat: true,
          lon: true,
          placeId: true,
          isVerified: true,
          soundTag: true,
          lightTag: true,
          aromaTag: true,
          crowdTag: true,
        }
      });

      // fetch avg ratings separately for each location
      dbLocations = await Promise.all(
        dbLocations.map(async (loc) => {
          const avg = await prisma.sensoryReport.aggregate({
            where: { locationId: loc.id },
            _avg: {
              soundTag: true,
              lightTag: true,
              aromaTag: true,
              crowdTag: true,
            }
          });

          return {
            ...loc,
            isRegistered: true,
            avgRatings: {
              quiet: avg._avg?.soundTag ?? null,
              aroma: avg._avg?.aromaTag ?? null,
              crowd: avg._avg?.crowdTag ?? null,
              lighting: avg._avg?.lightTag ?? null
            }
          };
        })
      );

    } catch (err) {
      console.error('Nearby DB query failed, falling back to Overpass-only results:', err);
    }

    // 2. Overpass OSM places (only when no filters)
    let osmPlaces = [];
    if (!filters.length) {
      try {
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

        const osmRes = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'WalksAndChill github.com/RiseMantis'
          }
        });

        if (!osmRes.ok) {
          console.error(`Overpass API responded with ${osmRes.status}`);
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
    }

    // 3. Combine DB + OSM, dedupe, max 7
    const combined = [...dbLocations];
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