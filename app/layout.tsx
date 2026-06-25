import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/lib/booking-context";
import TabBar from "@/components/tab-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://studiobook.example"),
  title: {
    default: "StudioBook — Trouve ton studio créatif",
    template: "%s · StudioBook",
  },
  description:
    "Réservez un studio créatif à l'heure partout en France : musique, podcast, photo, vidéo, danse. Réservation en ligne et paiement sécurisé en 2 minutes.",
  applicationName: "StudioBook",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "StudioBook" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "StudioBook — Trouve ton studio créatif",
    description: "Réservez un studio créatif à l'heure partout en France.",
    type: "website",
    locale: "fr_FR",
    siteName: "StudioBook",
  },
};

export const viewport: Viewport = {
  themeColor: "#101827",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-brand text-ink">
        <a href="#main" className="skip-link">
          Aller au contenu principal
        </a>
        <BookingProvider>
          {/* Colonne mobile-first centrée sur fond navy (effet device sur desktop) */}
          <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-cream shadow-2xl shadow-black/30">
            <main id="main" className="flex-1 pb-24">
              {children}
            </main>
            <TabBar />
          </div>
        </BookingProvider>
      </body>
    </html>
  );
}
