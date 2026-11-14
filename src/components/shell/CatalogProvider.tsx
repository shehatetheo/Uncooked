"use client";
import type { ReactNode } from "react";
import { setCatalog, type CatalogItem } from "@/lib/catalog";

/** Loads the slim item index (sent once from the server) before any page renders. */
export function CatalogProvider({ items, children }: { items: CatalogItem[]; children: ReactNode }) {
  setCatalog(items);
  return <>{children}</>;
}
