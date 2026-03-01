export default function Home() {
  return (
    <main className="text-white">

      {/* ================= HERO ================= */}
      <section className="relative h-screen flex flex-col justify-between px-16 py-12">

        {/* MENU */}
        <nav className="flex gap-10 text-xl font-semibold">
          <a href="#services" className="hover:opacity-70">Services</a>
          <a href="#contact" className="hover:opacity-70">Contact</a>
        </nav>

        {/* TITRE */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            La précision commence ici
          </h1>

          <a
            href="#services"
            className="mt-8 inline-block px-8 py-4 rounded-full bg-white text-black font-semibold hover:opacity-90 transition"
          >
            Réserver
          </a>
        </div>

        <div className="text-sm opacity-60">
          © 2026 Barber Booking
        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section
        id="services"
        className="min-h-screen bg-black text-white px-16 py-24"
      >
        <h2 className="text-4xl font-bold mb-16">
          Services
        </h2>

        <div className="grid md:grid-cols-3 gap-12">

          {/* Card 1 */}
          <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl">
            <h3 className="text-2xl font-semibold mb-4">Coupe homme</h3>
            <p className="opacity-70 mb-6">Coupe classique</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">15€</span>
              <button className="px-4 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition">
                Choisir
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl">
            <h3 className="text-2xl font-semibold mb-4">Coupe + barbe</h3>
            <p className="opacity-70 mb-6">Taille et finition</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">25€</span>
              <button className="px-4 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition">
                Choisir
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl">
            <h3 className="text-2xl font-semibold mb-4">Coloration</h3>
            <p className="opacity-70 mb-6">Coloration + finition</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">40€</span>
              <button className="px-4 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition">
                Choisir
              </button>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
