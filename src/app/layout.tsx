import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubScan — Subdomain Intelligence Scanner",
  description:
    "Advanced subdomain enumeration and security analysis tool. Multi-source scanning, Cloudflare & WAF detection, SSL intelligence, and risk scoring — all in one dashboard.",
  keywords: [
    "subdomain finder",
    "subdomain enumeration",
    "reconnaissance",
    "cybersecurity",
    "WAF detection",
    "Cloudflare detection",
    "security scanner",
    "bug bounty",
  ],
  authors: [{ name: "Yudzxml" }],
  creator: "Yudzxml",
  openGraph: {
    title: "SubScan — Subdomain Intelligence Scanner",
    description:
      "Advanced cybersecurity tool for subdomain enumeration and security analysis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubScan — Subdomain Intelligence Scanner",
    description:
      "Advanced cybersecurity tool for subdomain enumeration and security analysis",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
