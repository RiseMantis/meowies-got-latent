import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lon } = body;

    console.log("Received ID:", lat, lon);

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}