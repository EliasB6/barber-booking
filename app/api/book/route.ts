// app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminSupabase() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) {
    // On renvoie un message ultra clair + debug safe
    throw new Error(
      `Missing env. SUPABASE_URL=${Boolean(url)} SUPABASE_SERVICE_ROLE_KEY=${Boolean(
        key
      )}`
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { service_id, start_time, client, notes } = body;

    if (!service_id || !start_time || !client?.name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["service_id", "start_time", "client.name"],
          received: body,
        },
        { status: 400 }
      );
    }

    // 1) créer (ou retrouver) le client
    // On essaie d'éviter les doublons via email si fourni.
    // Si pas d'email, on fait un insert simple.
    let clientId: string | null = null;

    if (client.email) {
      // upsert sur email (si tu as une contrainte unique sur email, c'est parfait)
      const { data: upserted, error: upsertErr } = await supabase
        .from("clients")
        .upsert(
          {
            name: client.name,
            phone: client.phone ?? null,
            email: client.email,
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();

      if (upsertErr) {
        return NextResponse.json(
          { error: "Failed to upsert client", details: upsertErr, sent: body },
          { status: 500 }
        );
      }

      clientId = upserted?.id ?? null;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("clients")
        .insert({
          name: client.name,
          phone: client.phone ?? null,
          email: null,
        })
        .select("id")
        .single();

      if (insertErr) {
        return NextResponse.json(
          { error: "Failed to insert client", details: insertErr, sent: body },
          { status: 500 }
        );
      }

      clientId = inserted?.id ?? null;
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Client id missing after insert/upsert", sent: body },
        { status: 500 }
      );
    }

    // 2) créer le booking
    // (on met status="pending" pour éviter NOT NULL sans default)
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        service_id,
        client_id: clientId,
        start_time, // timestamptz attendu
        notes: notes ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (bookingErr) {
      return NextResponse.json(
        { error: "Failed to create booking", details: bookingErr, sent: body },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, booking }, { status: 201 });
  } catch (e: any) {
    // Ici on expose une erreur explicite + safe
    return NextResponse.json(
      { error: "Server error", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
