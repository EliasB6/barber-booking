import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important sur Vercel

function getAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!key) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function splitName(fullName?: string) {
  const s = (fullName ?? "").trim();
  if (!s) return { first_name: null as string | null, last_name: null as string | null };
  const parts = s.split(/\s+/);
  const first = parts.shift() ?? null;
  const last = parts.length ? parts.join(" ") : null;
  return { first_name: first, last_name: last };
}

export async function POST(req: Request) {
  const supabase = getAdmin();

  try {
    const body = await req.json();

    const service_id: string | undefined = body?.service_id;
    const start_time: string | undefined = body?.start_time;
    const notes: string | null = body?.notes ?? null;

    const client = body?.client ?? {};
    const email: string | undefined = client?.email;
    const phone: string | null = client?.phone ?? null;
    const { first_name, last_name } = splitName(client?.name);

    if (!service_id) {
      return NextResponse.json({ error: "Missing service_id" }, { status: 400 });
    }
    if (!start_time) {
      return NextResponse.json({ error: "Missing start_time" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Missing client.email" }, { status: 400 });
    }

    // 1) Récupérer la durée du service pour calculer end_time (si ta table services l'a)
    const { data: serviceRow, error: serviceErr } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", service_id)
      .single();

    if (serviceErr) {
      return NextResponse.json(
        { error: "Failed to fetch service", details: serviceErr },
        { status: 500 }
      );
    }

    const durationMinutes = Number(serviceRow?.duration_minutes ?? 0);
    const start = new Date(start_time);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid start_time" }, { status: 400 });
    }
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    // 2) Upsert client (par email)
    const { data: clientRow, error: clientErr } = await supabase
      .from("clients")
      .upsert(
        { email, phone, first_name, last_name },
        { onConflict: "email" }
      )
      .select("id,email")
      .single();

    if (clientErr) {
      return NextResponse.json(
        { error: "Failed to upsert client", details: clientErr, sent: { email, phone, first_name, last_name } },
        { status: 500 }
      );
    }

    // 3) Insert booking
    // ⚠️ Si ton enum/status est différent, tu peux enlever status ou changer la valeur.
    const bookingPayload: any = {
      service_id,
      client_id: clientRow.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes,
      status: "pending",
    };

    const { data: bookingRow, error: bookingErr } = await supabase
      .from("bookings")
      .insert(bookingPayload)
      .select("id, service_id, client_id, start_time, end_time, status")
      .single();

    if (bookingErr) {
      return NextResponse.json(
        { error: "Failed to insert booking", details: bookingErr, sent: bookingPayload },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, booking: bookingRow }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
