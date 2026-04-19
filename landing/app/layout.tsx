import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axon — The open policy layer for AI agents that move real money",
  description:
    "One .apl file governs every action your agent takes. Deterministic decisions. Tamper-evident audit. EU AI Act Article 12, MiCA, and DORA compatible out of the box.",
  openGraph: {
    title: "Axon — Policy & Audit Layer for AI Agents",
    description: "Deterministic policy enforcement and tamper-evident audit for autonomous AI agents.",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
