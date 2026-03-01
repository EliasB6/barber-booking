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
    throw new Error(
      `Missing env. SUPABASE_URL=${Boolean(url)} SUPABASE_SERVICE_ROLE_KEY=${Boolean(
        key
      )}`
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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

    const email = client.email?.trim() || null;
    const phone = client.phone?.trim() || null;

    let clientId: string | null = null;

    // ✅ GET-OR-CREATE sans upsert (pas besoin de UNIQUE sur email)
    if (email) {
      // 1) chercher un client existant
      const { data: existing, error: findErr } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (findErr) {
        return NextResponse.json(
          { error: "Failed to find client", details: findErr, sent: body },
          { status: 500 }
        );
      }

      if (existing?.id) {
        clientId = existing.id;

        // 2) update léger (au cas où)
        const { error: updateErr } = await supabase
          .from("clients")
          .update({
            name: client.name,
            phone,
          })
          .eq("id", clientId);

        if (updateErr) {
          return NextResponse.json(
            { error: "Failed to update client", details: updateErr, sent: body },
            { status: 500 }
          );
        }
      } else {
        // 3) insert
        const { data: inserted, error: insertErr } = await supabase
          .from("clients")
          .insert({
            name: client.name,
            phone,
            email,
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
    } else {
      // Pas d'email -> insert direct
      const { data: inserted, error: insertErr } = await supabase
        .from("clients")
        .insert({
          name: client.name,
          phone,
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
        { error: "Client id missing after create", sent: body },
        { status: 500 }
      );
    }

    // ✅ créer le booking
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        service_id,
        client_id: clientId,
        start_time,
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
    return NextResponse.json(
      { error: "Server error", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
