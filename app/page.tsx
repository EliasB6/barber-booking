import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id,name,description,price_cents,duration_minutes")
    .order("duration_minutes", { ascending: true });

  const { data: weekly, error: weeklyError } = await supabase
    .from("weekly_availability")
    .select("id,day_of_week,start_time,end_time,is_active")
    .order("day_of_week", { ascending: true });

  const dayLabel: Record<number, string> = {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
  };

  return (
    <main className="p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Services</h1>

        {servicesError && (
          <pre className="mt-4 rounded bg-red-950/40 p-3 text-sm">
            {JSON.stringify(servicesError, null, 2)}
          </pre>
        )}

        <ul className="mt-4 space-y-3">
          {(services ?? []).map((s) => (
            <li key={s.id} className="rounded border p-4">
              <div className="font-medium">{s.name}</div>
              <div className="text-sm opacity-80">{s.description}</div>
              <div className="mt-2 text-sm">
                {s.duration_minutes} min — {(s.price_cents / 100).toFixed(2)} €
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Horaires (weekly_availability)</h2>

        {weeklyError && (
          <pre className="mt-4 rounded bg-red-950/40 p-3 text-sm">
            {JSON.stringify(weeklyError, null, 2)}
          </pre>
        )}

        <ul className="mt-4 space-y-2">
          {(weekly ?? []).map((w) => (
            <li key={w.id} className="rounded border p-3 text-sm">
              <span className="font-medium">
                {dayLabel[w.day_of_week] ?? `Jour ${w.day_of_week}`}
              </span>
              {" — "}
              {w.is_active ? (
                <span>
                  {String(w.start_time).slice(0, 5)} → {String(w.end_time).slice(0, 5)}
                </span>
              ) : (
                <span className="opacity-70">Fermé</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
