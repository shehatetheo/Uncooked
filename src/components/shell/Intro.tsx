"use client";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, readTokens } from "./tokens";

/** 5×7 block letters for the logo. */
const FONT: Record<string, string[]> = {
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  N: ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
};
const WORD = "UNCOOKED";
const TAGLINE = "learn it. type the ghost. solve it cold.";
const SCRAMBLE = "▓▒░#%&@$*+=";
const COLS = WORD.length * 6 - 1;
const ROWS = 7;

interface Cell { col: number; row: number; letter: number; delay: number; glyph: number; tint: number }

const T_METEOR = 550;
const T_FLY = 1100;
const T_LOCK = 700;
const T_HOLD = 700;
const T_FADE = 350;
const TOTAL = T_METEOR + T_FLY + T_LOCK + T_HOLD + T_FADE;
const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/**
 * Session intro: a pixel meteor streaks in and bursts, and the fragments
 * scramble and lock into the UNCOOKED logo. Any key or tap skips it.
 */
export function Intro() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("uncooked:intro")) return;
      sessionStorage.setItem("uncooked:intro", "1");
    } catch {
      return;
    }
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const tk = readTokens();
    const sparks = [tk.accent, tk.second, tk.error, tk.text, tk["line-strong"]];
    const still = prefersReducedMotion();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const size = Math.max(5, Math.min(16, Math.floor((W - 32) / COLS)));
    const x0 = Math.round((W - COLS * size) / 2);
    const y0 = Math.round(H / 2 - (ROWS * size) / 2 - size);
    const burst = { x: W / 2, y: y0 + (ROWS * size) / 2 };

    const cells: Cell[] = [];
    [...WORD].forEach((ch, li) =>
      FONT[ch]!.forEach((line, row) =>
        [...line].forEach((bit, c) => {
          if (bit === "#") cells.push({ col: li * 6 + c, row, letter: li, delay: Math.random() * 0.35 + li * 0.03, glyph: Math.floor(Math.random() * 99), tint: Math.floor(Math.random() * sparks.length) });
        }),
      ),
    );

    let raf = 0;
    let done = false;
    const start = performance.now() - (still ? T_METEOR + T_FLY + T_LOCK : 0);
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      setShow(false);
    };

    const frame = (now: number) => {
      const t = now - start;
      if (t >= TOTAL) return finish();
      raf = requestAnimationFrame(frame);
      ctx.globalAlpha = 1;
      ctx.fillStyle = tk.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.font = `${size}px "JetBrains Mono Variable", monospace`;
      ctx.textBaseline = "top";
      const fade = t > TOTAL - T_FADE ? 1 - (t - (TOTAL - T_FADE)) / T_FADE : 1;
      canvas.style.opacity = String(fade);

      if (t < T_METEOR) {
        // meteor: head plus a stepped trail, from the top right into the centre
        const p = t / T_METEOR;
        const sx = W * 0.92, sy = -20;
        for (let i = 0; i < 14; i++) {
          const q = Math.max(0, p - i * 0.022);
          ctx.fillStyle = i === 0 ? tk.text : i < 5 ? tk.dim : tk.ghost;
          const s = i < 3 ? size : Math.max(2, size - i * 0.6);
          ctx.fillRect(Math.round((sx + (burst.x - sx) * q) / size) * size, Math.round((sy + (burst.y - sy) * q) / size) * size, s, s);
        }
        return;
      }

      const tf = t - T_METEOR;
      const locked = tf >= T_FLY;
      const lockT = tf - T_FLY;
      for (const c of cells) {
        const p = easeOut((tf / T_FLY - c.delay) / (1 - 0.6));
        const tx = x0 + c.col * size;
        const ty = y0 + c.row * size;
        const x = burst.x + (tx - burst.x) * p;
        const y = burst.y + (ty - burst.y) * p + Math.sin(p * Math.PI) * (c.row - 3) * size * 1.2;
        if (p >= 1 && (locked || tf / T_FLY > c.delay + 0.75)) {
          // the two O's are the eyes: their colour cycles once before settling
          const eye = (c.letter === 3 || c.letter === 4) && locked && lockT < T_LOCK;
          ctx.fillStyle = eye ? [tk.error, tk.second, tk.accent][Math.min(2, Math.floor((lockT / T_LOCK) * 3))]! : c.letter === 3 || c.letter === 4 ? tk.accent : tk.text;
          ctx.fillRect(tx, ty, size - 1, size - 1);
        } else {
          ctx.fillStyle = sparks[c.tint]!;
          const g = SCRAMBLE[(c.glyph + Math.floor(now / 60)) % SCRAMBLE.length]!;
          ctx.fillText(g, Math.round(x), Math.round(y));
        }
      }
      if (locked) {
        const n = Math.min(TAGLINE.length, Math.floor((lockT / T_LOCK) * TAGLINE.length));
        ctx.font = `${Math.max(11, Math.min(15, size * 1.6))}px "JetBrains Mono Variable", monospace`;
        ctx.fillStyle = tk.dim;
        ctx.textAlign = "center";
        ctx.fillText(TAGLINE.slice(0, n) + (n < TAGLINE.length ? "█" : ""), W / 2, y0 + ROWS * size + size * 2);
        ctx.textAlign = "left";
      }
    };

    raf = requestAnimationFrame(frame);
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-bg" role="presentation">
      <canvas ref={ref} className="h-full w-full" aria-label="Uncooked" />
      <p className="label absolute inset-x-0 bottom-0 pb-[calc(env(safe-area-inset-bottom)+16px)] text-center">press any key to skip</p>
    </div>
  );
}
