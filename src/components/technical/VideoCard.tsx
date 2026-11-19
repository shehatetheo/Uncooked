"use client";
import { useState } from "react";
import type { Video } from "@content/technical";
import { actions, useStore } from "@/lib/store";
import { cx } from "@/components/ui";

/** A YouTube video: plays inline on tap (privacy-enhanced embed), opens in YouTube, can be ticked as watched. */
export function VideoCard({ v, autoload, compact }: { v: Video; autoload?: boolean; compact?: boolean }) {
  const s = useStore();
  const key = `vid-${v.id}`;
  const watched = !!s.planDone[key];
  const [play, setPlay] = useState(!!autoload);
  return (
    <div className="flex flex-col gap-2" data-testid={`video-${v.id}`}>
      <div className="relative w-full overflow-hidden bg-inset shadow-[inset_0_0_0_1px_var(--color-line)]" style={{ aspectRatio: "16 / 9" }}>
        {play ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1&modestbranding=1`}
            title={v.title}
            loading="lazy"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" className="group absolute inset-0 flex flex-col items-center justify-center gap-2" onClick={() => setPlay(true)} aria-label={`Play ${v.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:opacity-70" loading="lazy" />
            <span className="relative font-pixel text-2xl text-accent">▶</span>
            <span className="relative label text-text">play · {v.length}</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cx("text-sm", compact && "text-xs")}>{v.title}</p>
          <p className="text-xs text-dim">{v.channel} · {v.length}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <a className="btn btn-sm" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer">YouTube ↗</a>
          <button type="button" className="btn btn-sm" role="checkbox" aria-checked={watched} onClick={() => actions.togglePlanTask(key)}>{watched ? "[■] watched" : "[ ] watched"}</button>
        </div>
      </div>
      {!compact && <p className="text-xs text-second">{v.note}</p>}
    </div>
  );
}
