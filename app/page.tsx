export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
      }}
    >
      {/* MENU */}
      <div style={{ fontSize: "22px", fontWeight: 600 }}>
        <a href="#services" style={{ marginRight: "30px" }}>
          Services
        </a>
        <a href="#contact">Contact</a>
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 900,
            marginBottom: "30px",
          }}
        >
          La précision commence ici
        </h1>

        <button
          style={{
            padding: "14px 28px",
            borderRadius: "40px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Réserver
        </button>
      </div>

      {/* FOOTER */}
      <div style={{ fontSize: "14px", opacity: 0.6 }}>
        © 2026 Barber Booking
      </div>
    </main>
  );
}
