import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Boot } from "@/components/shell/Boot";
import { Intro } from "@/components/shell/Intro";
import { Nav } from "@/components/shell/Nav";
import { Shortcuts } from "@/components/shell/Shortcuts";
import { Starfield } from "@/components/shell/Starfield";
import { CatalogProvider } from "@/components/shell/CatalogProvider";
import { buildCatalog } from "@/lib/catalog-build";
import { problems, sqlProblems } from "@/lib/content";

const CATALOG = buildCatalog();

// every route, handed to the service worker so the whole app opens offline
const WARM_URLS = ["/", "/problems", "/sql", "/quiz", "/resume", "/behavioral", "/review", "/timed", "/stats", "/tracks", "/sheets", "/settings", ...problems.map((p) => `/p/${p.id}`), ...sqlProblems.map((p) => `/sql/${p.id}`)];

export const metadata: Metadata = {
  title: { default: "Uncooked", template: "%s · Uncooked" },
  description: "Learn it, type the ghost, solve it cold. A technical interview trainer.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Uncooked", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#060a13",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Starfield />
        <Nav />
        <CatalogProvider items={CATALOG}>
          <main className="mx-auto max-w-[1400px] px-4 pb-[calc(env(safe-area-inset-bottom)+72px)] pt-6 md:pb-12">{children}</main>
        </CatalogProvider>
        <Shortcuts />
        <Intro />
        <Boot warmUrls={WARM_URLS} />
      </body>
    </html>
  );
}
