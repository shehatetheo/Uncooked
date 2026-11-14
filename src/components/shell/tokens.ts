"use client";
/** Read design tokens for canvas drawing, so canvases never hard-code colours. */
export type TokenName = "bg" | "raised" | "inset" | "line" | "line-strong" | "text" | "dim" | "ghost" | "accent" | "accent-dim" | "error" | "second";

export function readTokens(): Record<TokenName, string> {
  const cs = getComputedStyle(document.documentElement);
  const names: TokenName[] = ["bg", "raised", "inset", "line", "line-strong", "text", "dim", "ghost", "accent", "accent-dim", "error", "second"];
  return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(`--color-${n}`).trim() || "#fff"])) as Record<TokenName, string>;
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
