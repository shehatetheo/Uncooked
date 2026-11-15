"use client";
import { useEffect } from "react";
import { setSoundEnabled } from "@/lib/sound";
import { flushStore, useStore } from "@/lib/store";


/** Client boot: keeps the sound engine in step with settings, registers the service worker. */
export function Boot({ warmUrls }: { warmUrls: string[] }) {
  const { settings } = useStore();
  useEffect(() => setSoundEnabled(settings.sound), [settings.sound]);
  // never lose the last keystrokes: write to storage the moment the page is hidden or closed
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden") flushStore();
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flushStore);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flushStore);
    };
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => {
          // once idle, cache every route so the whole app opens offline
          const warm = () => navigator.onLine && reg.active?.postMessage({ type: "warm", urls: warmUrls });
          if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 8000 });
          else setTimeout(warm, 4000);
        })
        .catch(() => {});
    }
    // warmUrls is a build-time constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
