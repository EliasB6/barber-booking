// app/page.tsx
export default function HomePage() {
  const services = [
    { title: "Coupe & Barbe", subtitle: "Taille et finition", price: "20 €", duration: "45 min" },
    { title: "Coupe", subtitle: "Coupe classique", price: "15 €", duration: "45 min" },
    { title: "Barbe", subtitle: "Précision", price: "5 €", duration: "20 min" },
  ];

  return (
    <main className="min-h-[100svh] bg-black text-white">
      {/* HERO */}
      <section
        id="top"
        className="relative min-h-[100svh] w-full overflow-hidden"
        style={{
          backgroundImage: "url('/pics_2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay (contraste léger, pas de flou) */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Nav (droite, comme ton mockup) */}
        <nav className="absolute right-10 top-10 z-10 hidden md:block">
          <ul className="space-y-6 text-right">
            <li>
              <a className="text-xl font-semibold tracking-tight text-white/90 hover:text-white" href="#services">
                Services
              </a>
            </li>
            <li>
              <a className="text-xl font-semibold tracking-tight text-white/90 hover:text-white" href="#contact">
                Contact
              </a>
            </li>
            <li>
              <a className="text-xl font-semibold tracking-tight text-white/90 hover:text-white" href="#social">
                Social
              </a>
            </li>
          </ul>
        </nav>

        {/* Nav mobile (simple) */}
        <nav className="absolute left-6 right-6 top-6 z-10 flex items-center justify-between md:hidden">
          <a className="text-sm font-semibold text-white/90" href="#services">
            Services
          </a>
          <a className="text-sm font-semibold text-white/90" href="#contact">
            Contact
          </a>
          <a className="text-sm font-semibold text-white/90" href="#social">
            Social
          </a>
        </nav>

        {/* Slogan + CTA (bas / centré) */}
        <div className="relative z-10 flex min-h-[100svh] items-end justify-center px-6 pb-20 md:pb-24">
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)] md:text-6xl">
              La précision commence ici
            </h1>

            <div className="mt-6 flex justify-center">
              <a
                href="#services"
                className="rounded-full bg-white/18 px-8 py-3 text-sm font-semibold text-white backdrop-blur-md
                           ring-1 ring-white/20 transition hover:bg-white/24 hover:ring-white/35"
              >
                Prendre rendez-vous
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative bg-black py-16 md:py-20">
        {/* Glow blobs (comme ton mockup, doux) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-10 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="absolute right-[10%] top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute left-[15%] bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Nos services</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.title}
                className="group relative overflow-hidden rounded-3xl bg-white/6 p-7 backdrop-blur-md
                           ring-1 ring-white/10 transition
                           hover:-translate-y-1 hover:ring-white/35 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]"
              >
                {/* contour brillant au hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(800px circle at 50% 0%, rgba(255,255,255,0.18), transparent 55%)",
                  }}
                />

                <div className="relative">
                  <div className="text-base font-semibold text-white">{s.title}</div>
                  <div className="mt-1 text-sm text-white/60">{s.subtitle}</div>

                  <div className="mt-8 text-4xl font-extrabold tracking-tight">{s.price}</div>
                  <div className="mt-2 text-xs text-white/50">Durée : {s.duration}</div>

                  <div className="mt-8">
                    <a
                      href="#contact"
                      className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5
                                 text-sm font-semibold text-white ring-1 ring-white/15
                                 transition hover:bg-white/16 hover:ring-white/30"
                    >
                      Réserver
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CONTACT CARD */}
          <div id="contact" className="mt-12 rounded-3xl bg-white/6 p-8 backdrop-blur-md ring-1 ring-white/10">
            <h3 className="text-2xl font-extrabold tracking-tight">Besoin d’un renseignement ?</h3>
            <p className="mt-2 text-sm text-white/60">
              Une question ? Un besoin spécifique ? Écris-nous et on te répond vite.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/60">Téléphone</div>
                <div className="mt-2 text-sm font-semibold text-white">06 00 00 00 00</div>
              </div>

              <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/60">E-mail</div>
                <div className="mt-2 text-sm font-semibold text-white">contact@tonsalon.com</div>
              </div>
            </div>

            {/* mini form (optionnel, pas de JS) */}
            <form className="mt-6 grid gap-3 md:grid-cols-2" action="#" method="post">
              <input
                className="rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-white/25"
                placeholder="Ton nom"
                name="name"
              />
              <input
                className="rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-white/25"
                placeholder="Ton email"
                name="email"
                type="email"
              />
              <textarea
                className="md:col-span-2 min-h-[110px] rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-white/25"
                placeholder="Message"
                name="message"
              />
              <button
                className="md:col-span-2 rounded-2xl bg-white/14 px-5 py-3 text-sm font-semibold text-white
                           ring-1 ring-white/15 transition hover:bg-white/18 hover:ring-white/30"
                type="submit"
              >
                Envoyer
              </button>
            </form>
          </div>

          {/* SOCIAL */}
          <div id="social" className="mt-14">
            <h3 className="text-3xl font-extrabold tracking-tight">Nos Réseaux</h3>

            <div className="mt-8 grid gap-4 md:max-w-xl">
              <a
                className="flex items-center gap-4 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 transition hover:ring-white/25"
                href="#"
              >
                <span className="text-xl">📸</span>
                <span className="text-sm font-semibold">@toninstagram</span>
              </a>

              <a
                className="flex items-center gap-4 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 transition hover:ring-white/25"
                href="#"
              >
                <span className="text-xl">🎵</span>
                <span className="text-sm font-semibold">@tontiktok</span>
              </a>

              <a
                className="flex items-center gap-4 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 transition hover:ring-white/25"
                href="#"
              >
                <span className="text-xl">▶️</span>
                <span className="text-sm font-semibold">@tonyoutube</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Barber Booking</span>
          <a className="text-white/60 hover:text-white" href="#top">
            Home
          </a>
        </div>
      </footer>
    </main>
  );
}
