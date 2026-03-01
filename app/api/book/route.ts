import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  service_id: string;
  start_time: string; // ISO
  client: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  notes?: string | null;
};

function getSupabaseAdmin() {
  // ✅ Recommandé (server-only)
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  if (!url || !key) {
    return { client: null as any, url, key, missing: true };
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { client, url, key, missing: false };
}

export async function POST(req: Request) {
  try {
    const supa = getSupabaseAdmin();

    if (supa.missing) {
      return NextResponse.json(
        {
          error: "Missing Supabase env vars",
          details: {
            hasUrl: !!supa.url,
            hasKey: !!supa.key,
            expected:
              "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on Vercel (Project → Settings → Environment Variables).",
          },
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Body;

    if (!body?.service_id || !body?.start_time || !body?.client?.name) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details:
            "Required: service_id, start_time (ISO), client: { name }",
          example: {
            service_id: "uuid",
            start_time: "2026-03-10T10:00:00.000Z",
            client: { name: "Test Client", phone: "0600000000", email: "a@b.com" },
            notes: "Test booking",
          },
        },
        { status: 400 }
      );
    }

    // 1) Récupérer la durée du service (pour calculer end_time)
    const { data: service, error: serviceErr } = await supa.client
      .from("services")
      .select("id, duration_minutes")
      .eq("id", body.service_id)
      .single();

    if (serviceErr) {
      return NextResponse.json(
        { error: "Failed to fetch service", details: serviceErr },
        { status: 500 }
      );
    }

    const start = new Date(body.start_time);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "start_time is not a valid ISO date", details: body.start_time },
        { status: 400 }
      );
    }

    const duration = Number(service?.duration_minutes ?? 0);
    const end = new Date(start.getTime() + Math.max(duration, 0) * 60_000);

    // 2) Créer le client
    const clientPayload: Record<string, any> = {
      name: body.client.name,
      phone: body.client.phone ?? null,
      email: body.client.email ?? null,
    };

    const { data: createdClient, error: clientErr } = await supa.client
      .from("clients")
      .insert(clientPayload)
      .select("id, name, phone, email")
      .single();

    if (clientErr) {
      // ✅ Erreur claire (RLS / column missing / etc.)
      return NextResponse.json(
        { error: "Failed to create client", details: clientErr, sent: clientPayload },
        { status: 500 }
      );
    }

    // 3) Créer le booking
    const bookingPayload: Record<string, any> = {
      service_id: body.service_id,
      client_id: createdClient.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: body.notes ?? null,
      status: "pending", // si tu as un enum/col status
    };

    // Si ta table bookings n'a pas "status", Supabase renverra une erreur claire.
    const { data: booking, error: bookingErr } = await supa.client
      .from("bookings")
      .insert(bookingPayload)
      .select("*")
      .single();

    if (bookingErr) {
      return NextResponse.json(
        { error: "Failed to create booking", details: bookingErr, sent: bookingPayload },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, client: createdClient, booking },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
