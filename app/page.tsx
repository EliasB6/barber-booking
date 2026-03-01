import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data, error } = await supabase
    .from("services")
    .select("id,name,description,price_cents,duration_minutes")
    .order("duration_minutes", { ascending: true });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Services</h1>

      {error && (
        <pre className="mt-4 rounded bg-red-950/40 p-3 text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <ul className="mt-4 space-y-3">
        {(data ?? []).map((s) => (
          <li key={s.id} className="rounded border p-4">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm opacity-80">{s.description}</div>
            <div className="mt-2 text-sm">
              {s.duration_minutes} min — {(s.price_cents / 100).toFixed(2)} €
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
