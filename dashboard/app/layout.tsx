import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — Axon",
    default: "Axon — Policy & Audit Layer for AI Agents",
  },
  description:
    "The open policy and audit layer for autonomous AI agents that move real money. EU AI Act, MiCA, and DORA compatible.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Axon",
  },
  robots: { index: false }, // App is private — don't index
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
