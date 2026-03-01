// app/api/availability/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminSupabase() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) {
    throw new Error(
      `Missing env. SUPABASE_URL=${Boolean(url)} SUPABASE_SERVICE_ROLE_KEY=${Boolean(
        key
      )}`
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("weekly_availability")
      .select("day_of_week,start_time,end_time,is_active")
      .eq("is_active", true)
      .order("day_of_week", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch availability", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
