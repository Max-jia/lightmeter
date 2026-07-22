import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Lightmeter — AI CRM for Photographers",
  description:
    "The AI-native CRM for photographers. Auto-reply to inquiries, send proposals, contracts, and get paid — all from one link.",
  keywords: ["photographer crm", "wedding photographer", "ai crm", "client management"],
  manifest: "/manifest.json",
  verification: {
    google: "21B3_bV-L1vFlAInF3AuX1XE2PjJdSfaRxEvrax4X8g",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Lightmeter",
  },
  openGraph: {
    title: "Lightmeter — AI CRM for Photographers",
    description: "Your clients, on autopilot.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Logo & icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        {/* Space Grotesk + Archivo from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-space-grotesk: 'Space Grotesk', sans-serif;
            --font-archivo: 'Archivo', sans-serif;
            --font-geist-mono: 'SF Mono', 'Fira Code', monospace;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-overlay)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-lg)",
              fontSize: "14px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
