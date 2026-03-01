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

function cleanSbError(err: any) {
  if (!err) return null;
  return {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  };
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

    const name = String(client.name).trim();
    const email = client.email ? String(client.email).trim() : null;
    const phone = client.phone ? String(client.phone).trim() : "";

    let clientId: string | null = null;

    // --- CLIENT: get-or-create ---
    if (email) {
      // 1) lookup
      const { data: existing, error: findErr } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (findErr) {
        return NextResponse.json(
          { error: "Failed to find client", details: cleanSbError(findErr), sent: body },
          { status: 500 }
        );
      }

      if (existing?.id) {
        clientId = existing.id;

        // update light
        const { error: updateErr } = await supabase
          .from("clients")
          .update({ name, phone })
          .eq("id", clientId);

        if (updateErr) {
          return NextResponse.json(
            { error: "Failed to update client", details: cleanSbError(updateErr), sent: body },
            { status: 500 }
          );
        }
      } else {
        // 2) insert
        const { data: inserted, error: insertErr } = await supabase
          .from("clients")
          .insert({ name, email, phone })
          .select("id")
          .single();

        if (insertErr) {
          // ✅ si UNIQUE sur email et que ça existe déjà → on récupère et continue
          if (insertErr.code === "23505") {
            const { data: again, error: againErr } = await supabase
              .from("clients")
              .select("id")
              .eq("email", email)
              .limit(1)
              .maybeSingle();

            if (againErr || !again?.id) {
              return NextResponse.json(
                {
                  error: "Client exists but failed to re-fetch",
                  details: cleanSbError(againErr) ?? cleanSbError(insertErr),
                  sent: body,
                },
                { status: 500 }
              );
            }

            clientId = again.id;
          } else {
            return NextResponse.json(
              { error: "Failed to insert client", details: cleanSbError(insertErr), sent: body },
              { status: 500 }
            );
          }
        } else {
          clientId = inserted?.id ?? null;
        }
      }
    } else {
      // pas d'email: insert direct
      const { data: inserted, error: insertErr } = await supabase
        .from("clients")
        .insert({ name, email: null, phone })
        .select("id")
        .single();

      if (insertErr) {
        return NextResponse.json(
          { error: "Failed to insert client (no email)", details: cleanSbError(insertErr), sent: body },
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

    // --- BOOKING ---
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
        { error: "Failed to create booking", details: cleanSbError(bookingErr), sent: body },
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
