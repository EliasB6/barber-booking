import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const service_id = body?.service_id as string;
    const start_time = body?.start_time as string; // ISO
    const client = body?.client as { name: string; phone?: string; email?: string };
    const notes = (body?.notes ?? null) as string | null;

    if (!service_id || !start_time || !client?.name) {
      return NextResponse.json(
        { error: "Missing required fields (service_id, start_time, client.name)" },
        { status: 400 }
      );
    }

    // 1) Crée le client (ou récupère-le si déjà existant via email)
    let client_id: string | null = null;

    if (client.email) {
      const { data: existing, error: findErr } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("email", client.email)
        .maybeSingle();

      if (findErr) {
        return NextResponse.json({ error: "Client lookup failed", details: findErr }, { status: 500 });
      }

      if (existing?.id) client_id = existing.id;
    }

    if (!client_id) {
      const { data: created, error: createErr } = await supabaseAdmin
        .from("clients")
        .insert({
          name: client.name,
          phone: client.phone ?? null,
          email: client.email ?? null,
        })
        .select("id")
        .single();

      if (createErr) {
        return NextResponse.json({ error: "Failed to create client", details: createErr }, { status: 500 });
      }

      client_id = created.id;
    }

    // 2) Récupère la durée du service pour calculer end_time
    const { data: svc, error: svcErr } = await supabaseAdmin
      .from("services")
      .select("duration_minutes")
      .eq("id", service_id)
      .single();

    if (svcErr) {
      return NextResponse.json({ error: "Failed to load service", details: svcErr }, { status: 500 });
    }

    const start = new Date(start_time);
    const end = new Date(start.getTime() + Number(svc.duration_minutes) * 60_000);

    // 3) Crée la réservation
    const { data: booking, error: bookErr } = await supabaseAdmin
      .from("bookings")
      .insert({
        client_id,
        service_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: "confirmed",
        notes,
      })
      .select("*")
      .single();

    if (bookErr) {
      return NextResponse.json({ error: "Failed to create booking", details: bookErr }, { status: 500 });
    }

    return NextResponse.json({ ok: true, booking }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid JSON or server error", details: String(e?.message ?? e) }, { status: 500 });
  }
}
