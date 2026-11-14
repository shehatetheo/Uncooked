"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { prefersReducedMotion, readTokens } from "./tokens";

const SCALE = 3; // one canvas pixel = 3 CSS pixels, scaled up unsmoothed
const FRAME_MS = 1000 / 30;

interface Star { x: number; y: number; phase: number; speed: number; big: boolean }
interface Meteor { x: number; y: number; vx: number; vy: number; life: number }

/** Low-resolution starfield, scaled up with pixelated rendering. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useStore().settings.reduceMotion;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const tokens = readTokens();
    const still = reduce || prefersReducedMotion();
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let nextMeteor = performance.now() + 4000 + Math.random() * 6000;
    let raf = 0;
    let last = 0;

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / SCALE);
      canvas.height = Math.ceil(window.innerHeight / SCALE);
      const count = Math.floor((canvas.width * canvas.height) / 900);
      stars = Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * canvas.width),
        y: Math.floor(Math.random() * canvas.height),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        big: Math.random() < 0.06,
      }));
      draw(performance.now());
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        // three brightness steps, not a smooth fade, so the twinkle reads as 8-bit
        const level = still ? 1 : Math.floor((Math.sin(s.phase + (t / 1000) * s.speed) + 1) * 1.5);
        if (level === 0) continue;
        ctx.fillStyle = level >= 2 && s.big ? tokens.dim : tokens.ghost;
        ctx.fillRect(s.x, s.y, 1, 1);
        if (s.big && level === 2) {
          ctx.fillStyle = tokens.ghost;
          ctx.fillRect(s.x - 1, s.y, 1, 1);
          ctx.fillRect(s.x + 1, s.y, 1, 1);
          ctx.fillRect(s.x, s.y - 1, 1, 1);
          ctx.fillRect(s.x, s.y + 1, 1, 1);
        }
      }
      if (meteor) {
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = i === 0 ? tokens.text : i < 4 ? tokens.dim : tokens.ghost;
          ctx.fillRect(Math.round(meteor.x - meteor.vx * i), Math.round(meteor.y - meteor.vy * i), 1, 1);
        }
      }
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < FRAME_MS) return;
      last = t;
      if (!meteor && t > nextMeteor) {
        meteor = { x: canvas.width * (0.3 + Math.random() * 0.7), y: -2, vx: -1.4, vy: 1, life: 0 };
      }
      if (meteor) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        if (++meteor.life > 120 || meteor.y > canvas.height + 10) {
          meteor = null;
          nextMeteor = t + 7000 + Math.random() * 9000;
        }
      }
      draw(t);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (!still) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-70"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
