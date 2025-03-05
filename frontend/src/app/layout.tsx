import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat, Montserrat_Alternates } from 'next/font/google';
import "./globals.css";
import * as React from 'react';
import { Toaster } from "react-hot-toast";
import AuthInitializer from "@/components/auth/AuthInitializer";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat-alternates',
  weight: ['700'],
  style: ['italic'],
});

export const metadata: Metadata = {
  title: "Fruition | Research Platform",
  description: "Connect with research opportunities and collaborate on projects",
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      { url: "/favicon_io/icon.png", type: "image/png" },
      { url: "/favicon_io/icon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/favicon_io/apple-icon.png" }
    ],
    other: [
      { url: "/favicon_io/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  },
  manifest: "/favicon_io/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${montserratAlternates.variable} antialiased`}
      >
        <AuthInitializer />
        <Toaster position="top-right" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
