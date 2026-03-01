import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Barber Booking",
  description: "Réservation en ligne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${geist.className} antialiased`}>
        {/* IMAGE NETTE */}
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url(/pics_2.png)" }}
        />

        {/* LÉGER VOILE NOIR (PAS DE BLUR) */}
        <div className="fixed inset-0 -z-10 bg-black/50" />

        {children}
      </body>
    </html>
  );
}
