import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase.auth.getUser();
  return NextResponse.json({ data, error });
}
