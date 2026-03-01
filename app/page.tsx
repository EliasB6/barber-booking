"use client";

import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_min: number;
  price_eur: number;
};

type WeeklyAvailability = {
  day_of_week: number; // 1..7 (lundi..dimanche)
  start_time: string;  // "10:00:00"
  end_time: string;    // "19:00:00"
  is_active: boolean;
};

const dayLabel: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

export default function Page() {
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<WeeklyAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [s, a] = await Promise.all([
          fetch("/api/services", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/availability", { cache: "no-store" }).then((r) => r.json()),
        ]);

        if (cancelled) return;

        setServices(Array.isArray(s?.data) ? s.data : []);
        setAvailability(Array.isArray(a?.data) ? a.data : []);
      } catch {
        // on garde silencieux pour l’instant
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const weekly = useMemo(() => {
    return availability
      .filter((x) => x.is_active)
      .sort((a, b) => a.day_of_week - b.day_of_week);
  }, [availability]);

  return (
    <main>
      {/* HERO */}
      <section className="hero" aria-label="Hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        <header className="hero-nav">
          <a className="brand" href="#top" aria-label="Accueil">
            {/* optionnel: logo / nom */}
          </a>
          <nav className="nav-links">
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <div className="hero-content">
          <h1 className="hero-title">La précision commence ici</h1>

          <div className="hero-cta">
            <a className="btn btn-primary" href="#book">
              Réserver
            </a>
            <a className="btn btn-ghost" href="#services">
              Voir les services
            </a>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head">
            <h2>Services</h2>
            <p>Choisis ta prestation. On s’occupe du reste.</p>
          </div>

          {loading ? (
            <div className="grid">
              <div className="card skeleton" />
              <div className="card skeleton" />
              <div className="card skeleton" />
            </div>
          ) : (
            <div className="grid">
              {services.map((s) => (
                <article key={s.id} className="card">
                  <div className="card-top">
                    <h3>{s.name}</h3>
                    <span className="badge">{s.duration_min} min</span>
                  </div>

                  <p className="muted">{s.description ?? "—"}</p>

                  <div className="card-bottom">
                    <span className="price">{Number(s.price_eur).toFixed(2)} €</span>
                    <a className="btn btn-small" href="#book">
                      Choisir
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="book">
        <div className="container">
          <div className="section-head">
            <h2>Réserver</h2>
            <p>On branche le vrai formulaire juste après. Là on pose la base propre.</p>
          </div>

          <div className="panel">
            <div className="panel-col">
              <h3>Horaires</h3>
              <div className="list">
                {weekly.map((w, idx) => (
                  <div key={idx} className="list-row">
                    <span className="label">{dayLabel[w.day_of_week]}</span>
                    <span className="value">
                      {w.start_time.slice(0, 5)} — {w.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-col">
              <h3>Prochaine étape</h3>
              <p className="muted">
                On ajoute : sélection service → date → créneaux dispo → submit → confirmation.
              </p>

              <div className="hint">
                ✅ Ton endpoint <code>/api/book</code> répond déjà OK (status 200), donc on peut
                construire l’UI sereinement.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container">
          <div className="section-head">
            <h2>Contact</h2>
            <p>Une question ? Un besoin spécifique ?</p>
          </div>

          <div className="panel">
            <div className="panel-col">
              <h3>Infos</h3>
              <div className="list">
                <div className="list-row">
                  <span className="label">Téléphone</span>
                  <span className="value">06 00 00 00 00</span>
                </div>
                <div className="list-row">
                  <span className="label">Adresse</span>
                  <span className="value">À compléter</span>
                </div>
                <div className="list-row">
                  <span className="label">Instagram</span>
                  <span className="value">@toncompte</span>
                </div>
              </div>
            </div>

            <div className="panel-col">
              <h3>Message</h3>
              <p className="muted">
                (On ajoute un mini formulaire après. Là on garde le design clean.)
              </p>
              <a className="btn btn-primary" href="#services">
                Revenir aux services
              </a>
            </div>
          </div>

          <footer className="footer">
            <span className="muted">© {new Date().getFullYear()} Barber Booking</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
