import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Google Fonts consolidated "Big Shoulders Display" into "Big Shoulders".
// Next.js has no fallback metrics for this family yet, so declare the
// fallback explicitly to avoid the "failed to find font override" warning.
const heading = Big_Shoulders({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-heading",
  adjustFontFallback: false,
  fallback: ["sans-serif"],
});

const body = IBM_Plex_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono-plex",
});

const TITLE = "Origin GTM Copilot";
const DESCRIPTION =
  "RAG copilot grounded in the Cursor, Graphite, and Origin knowledge base";

export const metadata: Metadata = {
  metadataBase: new URL("https://origin-gtm-copilot.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: TITLE,
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
