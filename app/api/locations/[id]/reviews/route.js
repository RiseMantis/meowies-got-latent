import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';
import { auth } from '@/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Fetch the 5 most recent reviews
    const recentReviews = await prisma.sensoryReport.findMany({
      where: { locationId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    // Fetch the 5 top reviews (most verified/confirmed)
    const topReviews = await prisma.sensoryReport.findMany({
      where: { locationId: id },
      orderBy: { confirms: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ recentReviews, topReviews });
  } catch (err) {
    console.error(`Error fetching reviews: ${err}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: locationId } = await params;
    const body = await req.json();
    const { soundTag, lightTag, crowdTag, aromaTag } = body;

    if (soundTag == null || lightTag == null || crowdTag == null || aromaTag == null) {
      return NextResponse.json({ error: "All sensory tags are required" }, { status: 400 });
    }

    // Upsert the user to ensure they exist in our database
    const email = session.user.email || `${session.user.name}@placeholder.com`;
    const user = await prisma.user.upsert({
      where: { name: session.user.name || "Unknown User" },
      update: { email: email },
      create: {
        name: session.user.name || "Unknown User",
        email: email
      }
    });

    // Create the sensory report
    const newReport = await prisma.sensoryReport.create({
      data: {
        locationId,
        userId: user.id,
        soundTag: parseInt(soundTag),
        lightTag: parseInt(lightTag),
        crowdTag: parseInt(crowdTag),
        aromaTag: parseInt(aromaTag)
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(newReport);
  } catch (err) {
    console.error(`Error creating review: ${err}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
