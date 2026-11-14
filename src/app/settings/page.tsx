"use client";
import { useRef, useState } from "react";
import { PageHeader, Panel } from "@/components/ui";
import { problems } from "@/lib/content";
import { actions, useStore } from "@/lib/store";

const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="grid items-center gap-2 border-b border-line px-3 py-3 last:border-0 md:grid-cols-[1fr_auto]">
    <div>
      <p className="text-sm">{label}</p>
      {hint && <p className="text-xs text-dim">{hint}</p>}
    </div>
    <div className="flex flex-wrap gap-1">{children}</div>
  </div>
);

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" className="btn btn-sm" role="switch" aria-checked={on} aria-pressed={on} onClick={() => onChange(!on)}>{on ? "[■] on" : "[ ] off"}</button>
);

export default function SettingsPage() {
  const s = useStore();
  const { settings } = s;
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const [mediaId, setMediaId] = useState(problems[0]?.id ?? "");
  const [mediaUrl, setMediaUrl] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);

  const download = () => {
    const url = URL.createObjectURL(new Blob([actions.exportJson()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `uncooked-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ text: "Exported. Import this file on another device to carry your progress over." });
  };

  const onImport = async (f: File | undefined) => {
    if (!f) return;
    try {
      actions.importJson(await f.text());
      setMsg({ text: "Imported. This device now has that progress." });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Could not read that file.", bad: true });
    }
  };

  const saveMedia = () => {
    const url = mediaUrl.trim();
    const next = { ...settings.media };
    if (!url) delete next[mediaId];
    else {
      try {
        if (!["https:", "http:"].includes(new URL(url).protocol)) throw new Error();
      } catch {
        return setMsg({ text: "That isn't a valid http(s) URL.", bad: true });
      }
      next[mediaId] = url;
    }
    actions.setSettings({ media: next });
    setMsg({ text: url ? "Clip saved. It plays in the visual pane for that problem." : "Clip removed." });
    setMediaUrl("");
  };

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6">
      <PageHeader kicker="Settings" title="Tune it" />
      {msg && <p className={`text-sm ${msg.bad ? "text-error" : "text-accent"}`} role="status">{msg.text}</p>}

      <Panel title="Feel">
        <Row label="Sound blips" hint="8-bit key, error and pass sounds."><Toggle on={settings.sound} onChange={(v) => actions.setSettings({ sound: v })} /></Row>
        <Row label="Reduce motion" hint="Freezes the starfield. The system reduce-motion setting is always respected."><Toggle on={settings.reduceMotion} onChange={(v) => actions.setSettings({ reduceMotion: v })} /></Row>
        <Row label="Visuals by default" hint="Desktop only. Each problem also has its own Visual toggle."><Toggle on={settings.visualsDefault} onChange={(v) => actions.setSettings({ visualsDefault: v })} /></Row>
        <Row label="Rest between ghost reps" hint="Optional breather after each of the six reps. Always skippable.">
          {[0, 10, 20, 30, 60].map((n) => <button key={n} type="button" className="btn btn-sm" aria-pressed={settings.restSeconds === n} onClick={() => actions.setSettings({ restSeconds: n })}>{n === 0 ? "off" : `${n}s`}</button>)}
        </Row>
        <Row label="Replay the intro" hint="The meteor and logo animation plays once per session.">
          <button type="button" className="btn btn-sm" onClick={() => { try { sessionStorage.removeItem("uncooked:intro"); } catch { /* ignore */ } window.location.href = "/"; }}>Replay</button>
        </Row>
      </Panel>

      <Panel title="Clip for a problem's visual pane">
        <div className="flex flex-col gap-3 p-3">
          <p className="text-xs text-dim">Paste a video URL (for example a Higgsfield generation) and it plays in the visual pane during ghost typing, with a Clip toggle to switch back to the step-by-step trace.</p>
          <select className="field" value={mediaId} onChange={(e) => setMediaId(e.target.value)} aria-label="Problem">
            {problems.map((p) => <option key={p.id} value={p.id}>{p.title}{settings.media[p.id] ? "  (clip set)" : ""}</option>)}
          </select>
          <input className="field" type="url" inputMode="url" placeholder={settings.media[mediaId] ?? "https://…/clip.mp4"} value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} aria-label="Clip URL" autoCapitalize="off" autoCorrect="off" />
          <div className="flex gap-1">
            <button type="button" className="btn" onClick={saveMedia}>{mediaUrl.trim() ? "Save clip" : "Remove clip"}</button>
          </div>
        </div>
      </Panel>

      <Panel title="Progress data">
        <Row label="Export progress" hint="Progress lives on this device (IndexedDB). Export it to back up or move to another device.">
          <button type="button" className="btn" onClick={download}>Export JSON</button>
        </Row>
        <Row label="Import progress" hint="Replaces what's on this device with the file's contents.">
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onImport(e.target.files?.[0])} />
          <button type="button" className="btn" onClick={() => file.current?.click()}>Import JSON</button>
        </Row>
        <Row label="Erase progress" hint="Clears ratings, attempts, saved answers and drafts on this device. Settings stay.">
          {confirmWipe ? (
            <>
              <button type="button" className="btn text-error" onClick={() => { actions.wipe(); setConfirmWipe(false); setMsg({ text: "Progress erased on this device." }); }}>Yes, erase</button>
              <button type="button" className="btn" onClick={() => setConfirmWipe(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className="btn" onClick={() => setConfirmWipe(true)}>Erase…</button>
          )}
        </Row>
      </Panel>
      <p className="text-xs text-ghost">{Object.keys(s.progress).length} items tracked · {s.attempts.length} attempts logged · press ? for keyboard shortcuts</p>
    </div>
  );
}
