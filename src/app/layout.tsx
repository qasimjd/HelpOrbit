import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/themes.css";
import { ThemeProvider } from "@/components/branding/theme-provider";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelpOrbit - Multi-Tenant Support Platform",
  description: "Streamlined ticketing and customer support for modern organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script src="/scripts/theme-init.js" strategy="beforeInteractive" />
        <NextThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
