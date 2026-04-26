import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GeistSansFont, GeistMonoFont } from "./fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "Intaglio — The open policy layer for AI agents that move real money",
  description:
    "One .apl file governs every action your agent takes. Deterministic decisions. Tamper-evident audit. EU AI Act Article 12, MiCA, and DORA compatible out of the box.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Intaglio — Policy & Audit Layer for AI Agents",
    description:
      "Deterministic policy enforcement and tamper-evident audit for autonomous AI agents.",
    type: "website",
    locale: "en_US",
    siteName: "Intaglio",
    url: "https://landing-gules-phi.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Intaglio — Policy & Audit Layer for AI Agents",
    description:
      "Deterministic policy enforcement and tamper-evident audit for autonomous AI agents.",
  },
  robots: { index: true, follow: true },
  keywords: [
    "AI agent",
    "policy enforcement",
    "audit trail",
    "EU AI Act",
    "MiCA",
    "DORA",
    "stablecoin",
    "x402",
    "compliance",
    "open source",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSansFont.variable} ${GeistMonoFont.variable}`}>
      <body className={GeistSansFont.className}>{children}</body>
    </html>
  );
}
