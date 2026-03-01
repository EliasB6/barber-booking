// app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BookPayload = {
  service_id: string;
  start_time: string; // ISO date string e.g. "2026-03-10T10:00:00.000Z"
  client: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  notes?: string | null;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing SUPABASE_URL env var");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var");

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, details: details ?? null },
    { status: 400 }
  );
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();

    // 1) Read body safely
    let body: BookPayload;
    try {
      body = (await req.json()) as BookPayload;
    } catch {
      return badRequest("Invalid JSON body");
    }

    const { service_id, start_time, client, notes } = body ?? ({} as any);

    // 2) Validate payload
    if (!service_id || typeof service_id !== "string") {
      return badRequest("Missing or invalid service_id");
    }

    if (!start_time || typeof start_time !== "string") {
      return badRequest("Missing or invalid start_time");
    }

    const start = new Date(start_time);
    if (Number.isNaN(start.getTime())) {
      return badRequest("start_time must be a valid ISO date string");
    }

    if (!client || typeof client !== "object") {
      return badRequest("Missing client object");
    }
    if (!client.name || typeof client.name !== "string") {
      return badRequest("Missing or invalid client.name");
    }

    const phone = client.phone ?? null;
    const email = client.email ?? null;

    // 3) Create / find client (simple approach: always insert)
    const { data: clientRow, error: clientErr } = await supabase
      .from("clients")
      .insert([
        {
          name: client.name,
          phone,
          email,
        },
      ])
      .select("id,name,phone,email")
      .single();

    if (clientErr) {
      return NextResponse.json(
        { error: "Failed to create client", details: clientErr },
        { status: 500 }
      );
    }

    // 4) Create booking
    // Assumptions about your table:
    // bookings: id, client_id, service_id, start_time, status, notes, created_at
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert([
        {
          client_id: clientRow.id,
          service_id,
          start_time: start.toISOString(),
          status: "pending",
          notes: notes ?? null,
        },
      ])
      .select("id, client_id, service_id, start_time, status, notes, created_at")
      .single();

    if (bookingErr) {
      return NextResponse.json(
        { error: "Failed to create booking", details: bookingErr },
        { status: 500 }
      );
    }

    // 5) Success
    return NextResponse.json(
      { ok: true, booking, client: clientRow },
      { status: 201 }
    );
  } catch (e: any) {
    // Catch env missing or unexpected errors
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: e?.message ?? String(e),
      },
      { status: 500 }
    );
  }
}
