import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma.js';

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Fetch all sensory reports for this location
    const reports = await prisma.sensoryReport.findMany({
      where: { locationId: id },
      select: {
        soundTag: true,
        createdAt: true
      }
    });

    if (reports.length === 0) {
      return NextResponse.json({
        trends: [],
        message: "No sensory reports found for this location"
      });
    }

    // Group by hour of day and calculate average soundTag
    const hourlyTrends = new Map();

    reports.forEach((report) => {
      const hour = report.createdAt.getHours();

      if (!hourlyTrends.has(hour)) {
        hourlyTrends.set(hour, { count: 0, totalSound: 0 });
      }

      const current = hourlyTrends.get(hour);
      current.count += 1;
      current.totalSound += report.soundTag;
    });

    // Convert to array and calculate averages
    const trends = Array.from(hourlyTrends, ([hour, data]) => ({
      hour,
      averageSoundTag: Math.round((data.totalSound / data.count) * 100) / 100,
      reportCount: data.count
    })).sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      locationId: id,
      trends,
      totalReports: reports.length
    });
  } catch (err) {
    console.error(`Error fetching trends: ${err}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}