import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Flash Brega",
  description: "Acha, autentica, flash — aparece no telão",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Flash Brega",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a0a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased font-sans">{children}</body>
    </html>
  );
}
