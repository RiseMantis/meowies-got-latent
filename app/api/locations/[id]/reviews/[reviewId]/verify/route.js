import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';
import { auth } from '@/auth';

export async function POST(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;

    const updatedReport = await prisma.sensoryReport.update({
      where: { id: reviewId },
      data: {
        confirms: {
          increment: 1
        }
      }
    });

    return NextResponse.json(updatedReport);
  } catch (err) {
    console.error(`Error verifying review: ${err}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
