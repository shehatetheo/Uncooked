"use client";
/**
 * Thin wrappers over the browser's built-in speech APIs: no keys, no cost.
 * Recognition is Chrome/Edge and Safari (webkitSpeechRecognition); synthesis
 * is everywhere. Anything missing degrades to typing.
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

/** Push-to-talk recognizer that survives the pauses that end a browser session. */
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

  start() {
    const Ctor = recognitionCtor();
    if (!Ctor) return this.onError("Speech recognition isn't available in this browser. Type instead, or use the keyboard's dictation key.");
    this.committed = "";
    this.session = "";
    this.wanted = true;
    this.restarts = 0;
    this.open(Ctor);
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
        this.onError("Microphone access is blocked. Allow it in the browser's site settings, or type instead.");
      } else if (e.error === "network") {
        this.wanted = false;
        this.onError("Speech recognition needs a connection. Type instead.");
      }
      // "no-speech" and "aborted" just end the session; onend decides what next.
    };
    rec.onend = () => {
      this.committed = this.text;
      this.session = "";
      // Browsers end the session after a pause. Keep listening until the user says done.
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

  /** Finish and hand over what was heard (via onStop). */
  stop() {
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
      rec.abort();
    }
  }
}

/** Speaks streamed text sentence by sentence, so the voice starts before the reply is done. */
export class Speaker {
  enabled = true;
  onIdle: (() => void) | null = null;
  private buf = "";
  private pending = new Set<SpeechSynthesisUtterance>();
  private streaming = false;

  /** Call from a tap: iOS only allows speech that starts inside a user gesture. */
  unlock() {
    if (!canSpeak()) return;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }

  begin() {
    this.cancel();
    this.streaming = true;
  }

  feed(chunk: string) {
    this.buf += chunk;
    for (let m = this.buf.match(/^([\s\S]*?[.!?])(\s+)/); m; m = this.buf.match(/^([\s\S]*?[.!?])(\s+)/)) {
      this.say(m[1]!);
      this.buf = this.buf.slice(m[0].length);
    }
  }

  end() {
    this.streaming = false;
    if (this.buf.trim()) this.say(this.buf);
    this.buf = "";
    this.checkIdle();
  }

  /** Speak a whole piece of text (offline mode). */
  sayAll(text: string) {
    this.begin();
    this.feed(text + " ");
    this.end();
  }

  get speaking() {
    return this.pending.size > 0;
  }

  cancel() {
    this.buf = "";
    this.streaming = false;
    this.pending.clear();
    if (canSpeak()) window.speechSynthesis.cancel();
  }

  private say(text: string) {
    if (!this.enabled || !canSpeak() || !text.trim()) return;
    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = "en-US";
    u.rate = 1.03;
    const done = () => {
      this.pending.delete(u);
      this.checkIdle();
    };
    u.onend = done;
    u.onerror = done;
    this.pending.add(u);
    window.speechSynthesis.speak(u);
  }

  private checkIdle() {
    if (!this.streaming && this.pending.size === 0) this.onIdle?.();
  }
}
