// app/page.tsx
import Image from "next/image";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  duration_minutes?: number | null;
  price_eur?: number | null;
};

const FALLBACK_SERVICES: Service[] = [
  {
    id: "a3e8bd7b-1baa-4a4d-ab94-bb9e2c0865b3",
    name: "Coupe homme",
    description: "Coupe classique",
    duration_minutes: 30,
    price_eur: 15,
  },
  {
    id: "2b4b1f12-5d61-42fa-8570-a4b122422f7e",
    name: "Coupe + barbe",
    description: "Taille et finition",
    duration_minutes: 45,
    price_eur: 25,
  },
  {
    id: "c0a4b4d5-1111-4444-9999-222222222222",
    name: "Coloration",
    description: "Coloration + finition",
    duration_minutes: 60,
    price_eur: 40,
  },
];

export default async function HomePage() {
  const services = FALLBACK_SERVICES;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/pics_2.png"
          alt="Salon"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        {/* Nav */}
        <div className="absolute left-0 right-0 top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-6">
            <nav className="flex items-center gap-8 text-sm font-semibold text-white/80">
              <a href="#services" className="transition hover:text-white">
                Services
              </a>
              <a href="#contact" className="transition hover:text-white">
                Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex min-h-[92vh] items-center justify-center px-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
              La précision commence ici
            </h1>

            <div className="mt-8">
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Réserver
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-black">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-extrabold tracking-tight">Services</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.id}
                className="
                  group relative overflow-hidden rounded-3xl
                  border border-white/10 bg-white/[0.04] p-8
                  backdrop-blur-md transition
                  hover:-translate-y-1 hover:border-white/25
                "
              >
                {/* Contour brillant au hover */}
                <div
                  className="
                    pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition
                    group-hover:opacity-100
                    shadow-[0_0_0_1px_rgba(255,255,255,0.85),0_0_28px_rgba(255,255,255,0.18)]
                  "
                />

                <div className="relative">
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="mt-2 text-sm text-white/60">
                    {s.description ?? ""}
                  </p>

                  <div className="mt-8 flex items-end justify-between">
                    <div className="text-lg font-extrabold">
                      {typeof s.price_eur === "number" ? `${s.price_eur}€` : "—"}
                    </div>

                    {/* Pas de onClick ici (server component safe) */}
                    <a
                      href="#contact"
                      className="
                        rounded-full border border-white/15 bg-white/[0.03]
                        px-5 py-2 text-sm font-semibold text-white/80
                        transition
                        hover:border-white/30 hover:bg-white/[0.06] hover:text-white
                      "
                    >
                      Choisir
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-black">
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-md">
            <h2 className="text-2xl font-extrabold tracking-tight">Contact</h2>
            <p className="mt-2 text-sm text-white/60">
              Une question ? Un besoin spécifique ? Écris-nous et on te répond vite.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-xs font-semibold text-white/50">
                  Téléphone
                </div>
                <div className="mt-2 text-sm font-semibold text-white/90">
                  06 00 00 00 00
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-xs font-semibold text-white/50">
                  Instagram
                </div>
                <div className="mt-2 text-sm font-semibold text-white/90">
                  @toncompte
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Barber Booking</span>
          <a href="#services" className="transition hover:text-white/80">
            Retour aux services
          </a>
        </div>
      </footer>
    </main>
  );
}
