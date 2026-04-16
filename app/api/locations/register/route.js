import { NextResponse } from "next/server";
import {prisma} from '@/lib/prisma.js';
import {auth} from '@/auth';
import { parse } from "path";

export async function POST(req) {
  try{
    const session = await auth()

    if(!session){
      return NextResponse.json({error: "unauth"}, {status: 401});
    } 

    const body = await req.json();
    const { name, address, lat, lon, sound, lighting, crowd, aroma } = body;

    const newStore = await prisma.location.create({
      data: {
        name,
        address,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        soundTag: sound,
        lightTag: lighting,
        crowdTag: crowd,
        aromaTag: aroma,
        isVerified: true,
        ownerId: session.user.id,
      }
    });

    return NextResponse.json(newStore)
  }
  catch(err){
    console.error(`Error in registering store: ${err}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}