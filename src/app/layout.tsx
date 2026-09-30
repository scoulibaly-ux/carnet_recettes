import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { isAdmin } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Mon carnet de recettes",
    template: "%s · Mon carnet de recettes",
  },
  description: "Un carnet pour garder vos recettes et leurs photos.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const connected = await isAdmin();

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader connected={connected} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
          Mon carnet de recettes
        </footer>
      </body>
    </html>
  );
}
