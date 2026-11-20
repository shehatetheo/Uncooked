import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Uncooked", template: "%s · Uncooked" },
  description: "Mock coding interviews with an AI interviewer, on SAP-reported questions.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Uncooked", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#0e1014", width: "device-width", initialScale: 1, viewportFit: "cover" };

// The previous version of this app installed an offline service worker. Remove it so no device is stuck on old pages.
const CLEANUP = `if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
if ("caches" in window) caches.keys().then(function (ks) { ks.forEach(function (k) { if (k.indexOf("uncooked-") === 0) caches.delete(k); }); }).catch(function () {});`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: CLEANUP }} />
      </body>
    </html>
  );
}
