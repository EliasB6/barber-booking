// app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BookBody = {
  service_id: string;
  start_time: string; // ISO string
  notes?: string | null;
  client: {
    name: string; // on map -> first_name
    email: string;
    phone?: string | null;
  };
};

function jsonError(status: number, message: string, details?: any) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL) return jsonError(500, "Missing env var: SUPABASE_URL");
    if (!SUPABASE_SERVICE_ROLE_KEY)
      return jsonError(500, "Missing env var: SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = (await req.json()) as BookBody;

    // Basic validation
    if (!body?.service_id) return jsonError(400, "service_id is required");
    if (!body?.start_time) return jsonError(400, "start_time is required");
    if (!body?.client?.email) return jsonError(400, "client.email is required");
    if (!body?.client?.name) return jsonError(400, "client.name is required");

    const service_id = String(body.service_id);
    const start_time = String(body.start_time);
    const notes = body.notes ?? null;

    const email = String(body.client.email).trim().toLowerCase();
    const phone = body.client.phone ? String(body.client.phone).trim() : null;

    // Map vers ta table clients: first_name / last_name
    const first_name = String(body.client.name).trim();
    const last_name = ""; // tu peux splitter plus tard si tu veux

    // 1) Find existing client by email
    const { data: existingClient, error: findErr } = await supabase
      .from("clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      return jsonError(500, "Failed to find client", {
        message: findErr.message,
        code: findErr.code,
        details: findErr.details,
        hint: findErr.hint,
      });
    }

    let client_id: string;

    // 2) Insert or update client
    if (existingClient?.id) {
      client_id = existingClient.id;

      const { error: updateErr } = await supabase
        .from("clients")
        .update({
          first_name,
          last_name,
          phone,
        })
        .eq("id", client_id);

      if (updateErr) {
        return jsonError(500, "Failed to update client", {
          message: updateErr.message,
          code: updateErr.code,
          details: updateErr.details,
          hint: updateErr.hint,
        });
      }
    } else {
      // IMPORTANT: ta colonne created_at est NOT NULL chez toi.
      // Si tu as mis DEFAULT now() dans Supabase, tu peux enlever created_at ici.
      const { data: insertedClient, error: insertErr } = await supabase
        .from("clients")
        .insert({
          first_name,
          last_name,
          email,
          phone,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertErr) {
        return jsonError(500, "Failed to insert client", {
          message: insertErr.message,
          code: insertErr.code,
          details: insertErr.details,
          hint: insertErr.hint,
          sent: { first_name, last_name, email, phone },
        });
      }

      client_id = insertedClient.id;
    }

    // 3) Insert booking
    // Adapte les colonnes si ta table bookings a des noms différents
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        client_id,
        service_id,
        start_time,
        notes,
        status: "pending", // si tu as un enum, garde une valeur valide
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (bookingErr) {
      return jsonError(500, "Failed to insert booking", {
        message: bookingErr.message,
        code: bookingErr.code,
        details: bookingErr.details,
        hint: bookingErr.hint,
        sent: { client_id, service_id, start_time, notes },
      });
    }

    return NextResponse.json(
      { ok: true, booking },
      { status: 200 }
    );
  } catch (e: any) {
    return jsonError(500, "Unhandled error in /api/book", {
      message: e?.message ?? String(e),
      stack: e?.stack,
    });
  }
}
