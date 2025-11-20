// app/api/get-location/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get IP from headers (Vercel provides this)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');

    const res = await fetch(`https://ipapi.co/${ip || ''}/json/`);
    const data = await res.json();

    return NextResponse.json({
      country_name: data.country_name || "India",
      currency: data.currency || "INR"
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    return NextResponse.json({
      country_name: "India",
      currency: "INR"
    });
  }
}