import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barber Booking",
  description: "Réservation en ligne",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Background image */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url(/pics_2.png)" }}
        />
        {/* Overlay pour lisibilité */}
        <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-[2px]" />

        {/* Page container */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
