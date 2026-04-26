/**
 * Font configuration for Axon Landing Page
 * Using Geist Sans and Geist Mono from Vercel
 */
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const fonts = {
  sans: GeistSans,
  mono: GeistMono,
};

// Export individual fonts for convenience
export const GeistSansFont = GeistSans;
export const GeistMonoFont = GeistMono;