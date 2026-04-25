import { NextResponse } from "next/server";
import {prisma} from '@/lib/prisma.js';
import {auth} from '@/auth';
import { parse } from "path";

export async function POST(req) {
  try{
    const session = await auth()
    // Bypass strict 401 to allow unauthenticated DB testing/usage 
    const currentUserId = session?.user?.id || undefined;

    const body = await req.json();
    const { id, name, address, lat, lon, sound, light, crowd, aroma } = body;

    if (!lat || !lon || !name) {
      return NextResponse.json({ error: "Location coordinates are required" }, { status: 400 });
    }

    if (id) {
      const updatedStore = await prisma.location.update({
        where: { id: id },
        data: {
          soundTag: sound,
          lightTag: light,
          crowdTag: crowd,
          aromaTag: aroma,
          isVerified: true,
          ownerId: currentUserId,
          name: name,
          address: address 
        }
      });
      return NextResponse.json(updatedStore);
  } else {
    const newStore = await prisma.location.create({
      data: {
        name,
        address,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        soundTag: sound,
        lightTag: light,
        crowdTag: crowd,
        aromaTag: aroma,
        isVerified: true,
        ...(currentUserId && { ownerId: currentUserId }),
      }
    });
    return NextResponse.json(newStore);
  }
  }
  catch(err){
    console.error(`Error in registering store: ${err}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}