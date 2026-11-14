"use client";
/** Tiny square-wave blips. Off by default; enabled from settings. */
let ctx: AudioContext | null = null;
let enabled = false;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
};

function tone(freq: number, ms: number, delay = 0, gain = 0.03) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const t = ctx.currentTime + delay / 1000;
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + ms / 1000);
  } catch {
    /* audio is decorative; ignore failures */
  }
}

export const blip = {
  key: () => tone(880, 18, 0, 0.012),
  error: () => tone(140, 90),
  line: () => tone(660, 40),
  pass: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 90, i * 70)),
  fail: () => [330, 247].forEach((f, i) => tone(f, 140, i * 110)),
  tick: () => tone(440, 30),
};
