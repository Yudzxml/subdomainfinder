import type { Metadata } from "next";
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
  title: "Subdomain Intelligence - Cloudflare Security Scanner",
  description: "Advanced subdomain enumeration and Cloudflare detection tool with multi-source scanning capabilities.",
  keywords: ["subdomain", "Cloudflare", "security", "scanner", "WAF", "cybersecurity", "domain enumeration"],
  authors: [{ name: "Security Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Subdomain Intelligence Scanner",
    description: "Advanced cybersecurity tool for subdomain enumeration and Cloudflare detection",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subdomain Intelligence Scanner",
    description: "Advanced cybersecurity tool for subdomain enumeration and Cloudflare detection",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
