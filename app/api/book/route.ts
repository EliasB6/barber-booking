// app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Attendu (MVP)
    // {
    //   "service_id": "uuid",
    //   "start_time": "2026-03-10T10:00:00.000Z",
    //   "client": { "name": "Elias", "phone": "06...", "email": "..." }
    // }
    const service_id = body?.service_id as string | undefined;
    const start_time = body?.start_time as string | undefined;
    const client = body?.client as
      | { name?: string; phone?: string; email?: string }
      | undefined;

    if (!service_id || !start_time || !client?.name) {
      return NextResponse.json(
        {
          error: "Missing fields",
          expected:
            "service_id, start_time (ISO), client:{name, phone?, email?}",
        },
        { status: 400 }
      );
    }

    // 1) Récupérer la durée du service
    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("id,duration_minutes")
      .eq("id", service_id)
      .single();

    if (serviceErr || !service) {
      return NextResponse.json(
        { error: "Service not found", details: serviceErr },
        { status: 404 }
      );
    }

    const start = new Date(start_time);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start_time (must be ISO date string)" },
        { status: 400 }
      );
    }

    const end = addMinutes(start, Number(service.duration_minutes ?? 0));

    // 2) Créer le client (MVP simple)
    // ⚠️ Si ta table "clients" n'a pas ces colonnes, dis-moi son schéma exact.
    const { data: createdClient, error: clientErr } = await supabase
      .from("clients")
      .insert([
        {
          name: client.name,
          phone: client.phone ?? null,
          email: client.email ?? null,
        },
      ])
      .select("id")
      .single();

    if (clientErr || !createdClient) {
      return NextResponse.json(
        { error: "Failed to create client", details: clientErr },
        { status: 500 }
      );
    }

    // 3) Créer la réservation
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert([
        {
          client_id: createdClient.id,
          service_id,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: "confirmed",
          delay_minutes: 0,
          notes: body?.notes ?? null,
        },
      ])
      .select("id,client_id,service_id,start_time,end_time,status")
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json(
        { error: "Failed to create booking", details: bookingErr },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: { message: "Server error", details: String(e?.message ?? e) } },
      { status: 500 }
    );
  }
}
