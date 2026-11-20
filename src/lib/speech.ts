"use client";
/**
 * Voice in and out with the browser's own speech APIs: no keys, no cost.
 * Speech-to-text is Chrome, Edge and Safari (including iPhone). Anything
 * missing falls back to the text box.
 */

interface SRAlternative { transcript: string }
interface SRResult { isFinal: boolean; 0: SRAlternative; length: number }
interface SREvent { resultIndex: number; results: { length: number; [i: number]: SRResult } }
interface SRInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SRCtor = new () => SRInstance;

const recognitionCtor = (): SRCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const canListen = () => recognitionCtor() !== null;
export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Push-to-talk recognizer. Keeps listening through the pauses that end a browser session. */
export class Listener {
  private rec: SRInstance | null = null;
  private committed = "";
  private session = "";
  private wanted = false;
  private restarts = 0;

  constructor(
    private onUpdate: (text: string) => void,
    private onStop: (text: string) => void,
    private onError: (message: string) => void,
  ) {}

  get text() {
    return `${this.committed} ${this.session}`.replace(/\s+/g, " ").trim();
  }
  get active() {
    return this.wanted;
  }

  start() {
    const Ctor = recognitionCtor();
    if (!Ctor) return this.onError("This browser can't do speech-to-text. Type your answer instead.");
    if (this.wanted) return;
    this.committed = "";
    this.session = "";
    this.wanted = true;
    this.restarts = 0;
    try {
      this.open(Ctor);
    } catch {
      this.wanted = false;
      this.onError("The microphone didn't start. Try again, or type your answer.");
    }
  }

  private open(Ctor: SRCtor) {
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += `${e.results[i]![0].transcript} `;
      this.session = s;
      this.onUpdate(this.text);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        this.wanted = false;
        this.onError("Microphone access is blocked. Allow it in the browser's site settings, or type your answer.");
      } else if (e.error === "network") {
        this.wanted = false;
        this.onError("Speech-to-text needs a connection. Type your answer instead.");
      } else if (e.error === "audio-capture") {
        this.wanted = false;
        this.onError("No microphone was found. Type your answer instead.");
      }
      // "no-speech" and "aborted" just end the session; onend decides what next.
    };
    rec.onend = () => {
      this.committed = this.text;
      this.session = "";
      if (this.wanted && this.restarts++ < 30) {
        try {
          this.open(Ctor);
          return;
        } catch {
          /* fall through and stop */
        }
      }
      this.wanted = false;
      this.rec = null;
      this.onStop(this.text);
    };
    this.rec = rec;
    rec.start();
  }

  /** Finish and hand over what was heard (through onStop). */
  stop() {
    if (!this.wanted && !this.rec) return;
    this.wanted = false;
    if (this.rec) this.rec.stop();
    else this.onStop(this.text);
  }

  /** Throw away what was heard. */
  abort() {
    this.wanted = false;
    this.committed = "";
    this.session = "";
    const rec = this.rec;
    this.rec = null;
    if (rec) {
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    }
  }
}

/** Higher is more natural. Neural and "enhanced" voices beat the old robotic defaults. */
export function voiceScore(v: { name: string; lang: string; localService?: boolean }): number {
  if (!/^en[-_]/i.test(v.lang) && v.lang.toLowerCase() !== "en") return -1;
  const n = v.name.toLowerCase();
  let score = 0;
  if (/natural|neural/.test(n)) score += 60; // Edge's online voices
  if (/premium|enhanced|siri/.test(n)) score += 50; // downloaded Apple voices
  if (/^google (us|uk) english/.test(n)) score += 40; // Chrome's network voice
  if (/\b(samantha|ava|allison|evan|nathan|aria|jenny|guy|zoe|joelle)\b/.test(n)) score += 30;
  if (/\b(daniel|karen|moira|tessa|alex)\b/.test(n)) score += 15;
  if (/en[-_]us/i.test(v.lang)) score += 10;
  // novelty and legacy voices that ship with macOS and iOS
  if (/albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|fred|jester|junior|kathy|organ|ralph|superstar|trinoids|whisper|zarvox|compact|espeak/.test(n)) score -= 80;
  return score;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;
function bestVoice(): SpeechSynthesisVoice | null {
  if (!canSpeak()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // not loaded yet; the default voice is fine
  cachedVoice = [...voices].filter((v) => voiceScore(v) >= 0).sort((a, b) => voiceScore(b) - voiceScore(a))[0] ?? null;
  return cachedVoice;
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = undefined;
  });
}
export const voiceName = () => bestVoice()?.name ?? null;

// A very short silent clip: playing it inside a tap lets later audio play without one.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

/**
 * Speaks streamed text sentence by sentence, so the voice starts before the
 * reply is finished. Each sentence is fetched as audio from /api/speak and
 * played through an audio element. If the server can't make audio, it falls
 * back to the browser's built-in voice.
 */
export class Speaker {
  muted = false;
  /** Called when speech starts and when everything queued has been said. */
  onChange: ((speaking: boolean) => void) | null = null;
  private buf = "";
  private queue: { text: string; audio: Promise<string | null> }[] = [];
  private playing = false;
  private generation = 0;
  private el: HTMLAudioElement | null = null;
  private serverVoice = true;
  private pending = new Set<SpeechSynthesisUtterance>();
  private wasSpeaking = false;

  /** Call from a tap: browsers only allow sound that a user gesture started. */
  unlock() {
    if (typeof Audio !== "undefined") {
      this.el ??= new Audio();
      this.el.src = SILENCE;
      void this.el.play().catch(() => {});
    }
    if (canSpeak()) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }

  begin() {
    this.cancel();
  }

  feed(chunk: string) {
    this.buf += chunk;
    for (let m = this.buf.match(/^([\s\S]*?[.!?])(\s+)/); m; m = this.buf.match(/^([\s\S]*?[.!?])(\s+)/)) {
      this.say(m[1]!);
      this.buf = this.buf.slice(m[0].length);
    }
  }

  end() {
    if (this.buf.trim()) this.say(this.buf);
    this.buf = "";
    this.notify();
  }

  get speaking() {
    return this.playing || this.queue.length > 0 || this.pending.size > 0;
  }

  cancel() {
    this.generation++;
    this.buf = "";
    this.queue = [];
    this.playing = false;
    this.pending.clear();
    this.el?.pause();
    if (canSpeak()) window.speechSynthesis.cancel();
    this.notify();
  }

  private say(text: string) {
    const clean = text.trim();
    if (this.muted || !clean) return;
    // start fetching right away so sentences are ready back to back
    this.queue.push({ text: clean, audio: this.serverVoice ? this.fetchAudio(clean) : Promise.resolve(null) });
    this.notify();
    if (!this.playing) void this.pump();
  }

  private async fetchAudio(text: string): Promise<string | null> {
    try {
      const res = await fetch("/api/speak", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) throw new Error(String(res.status));
      return URL.createObjectURL(await res.blob());
    } catch {
      this.serverVoice = false; // don't keep asking; use the browser's voice from here on
      return null;
    }
  }

  private async pump() {
    const gen = this.generation;
    this.playing = true;
    while (this.queue.length && gen === this.generation) {
      const item = this.queue.shift()!;
      const url = await item.audio;
      if (gen !== this.generation) return;
      if (url) await this.playUrl(url);
      else await this.speakWithBrowser(item.text);
    }
    if (gen === this.generation) {
      this.playing = false;
      this.notify();
    }
  }

  private playUrl(url: string): Promise<void> {
    return new Promise((resolve) => {
      const el = (this.el ??= new Audio());
      const done = () => {
        el.onended = el.onerror = el.onpause = null;
        URL.revokeObjectURL(url);
        resolve();
      };
      el.onended = done;
      el.onerror = done;
      el.onpause = done; // cancel() pauses
      el.src = url;
      el.play().catch(done);
    });
  }

  private speakWithBrowser(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!canSpeak()) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 1.04;
      const voice = bestVoice();
      if (voice) u.voice = voice;
      const done = () => {
        this.pending.delete(u);
        resolve();
      };
      u.onend = done;
      u.onerror = done;
      this.pending.add(u);
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.speak(u);
      // a silent browser voice never reports the end: don't let it hold up the conversation
      setTimeout(done, Math.max(4000, text.length * 90));
    });
  }

  private notify() {
    const now = this.speaking;
    if (now !== this.wasSpeaking) {
      this.wasSpeaking = now;
      this.onChange?.(now);
    }
  }
}

/** Models sometimes slip markdown in. Strip it so it isn't shown or read aloud. */
export function plainSpeech(text: string): string {
  return text
    .replace(/<think>[\s\S]*?(<\/think>|$)/g, "")
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/[*_`#]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trimStart();
}
