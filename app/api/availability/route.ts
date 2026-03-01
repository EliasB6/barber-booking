import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!key) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getAdmin();

  const { data, error } = await supabase
    .from("weekly_availability")
    .select("day_of_week,start_time,end_time,is_active")
    .order("day_of_week", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load availability", details: error }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
