// app/api/get-location/route.ts
import { headers } from "next/headers";

export async function GET() {
  try {
    const ip =
      headers().get("x-real-ip") ||
      headers().get("x-forwarded-for")?.split(",")[0] ||
      "";

    const res = await fetch(`https://ipwho.is/${ip}`, {
      cache: "no-store",
    });

    const data = await res.json();

    return Response.json({
      country_name: data.country || "United States",
      currency: data.currency?.code || "USD",
    });
  } catch (err) {
    console.error("Geo API error:", err);

    // ⭐ DEFAULT TO USD
    return Response.json(
      {
        country_name: "United States",
        currency: "USD",
      },
      { status: 200 }
    );
  }
}
