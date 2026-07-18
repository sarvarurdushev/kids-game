"use client";

// Small procedural sound engine — short synthesized chimes/sweeps via the Web
// Audio API. No audio files, so nothing to load or fail to load. Muted by
// default (a kids' app making noise without being asked is disruptive); a
// student has to opt in via the mute toggle.

const MUTE_KEY = "gk_sound_muted";
const MUTE_EVENT = "gk-sound-mute-change";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => undefined);
  return audioContext;
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(MUTE_KEY);
  return stored === null ? true : stored === "true";
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, String(muted));
  window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: muted }));
  // Unlocking sound needs to happen inside the same user-gesture call stack
  // that flips the toggle, or the browser will keep the AudioContext suspended.
  if (!muted) getContext();
}

export function onSoundMuteChange(listener: (muted: boolean) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (e: Event) => listener((e as CustomEvent<boolean>).detail);
  window.addEventListener(MUTE_EVENT, handler);
  return () => window.removeEventListener(MUTE_EVENT, handler);
}

interface ToneOptions {
  freq: number;
  endFreq?: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  peakGain?: number;
}

function tone(ctx: AudioContext, { freq, endFreq, start, duration, type = "sine", peakGain = 0.15 }: ToneOptions) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function play(builder: (ctx: AudioContext, now: number) => void) {
  if (isSoundMuted()) return;
  const ctx = getContext();
  if (!ctx) return;
  builder(ctx, ctx.currentTime);
}

export function playCoin(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 880, start: now, duration: 0.1, type: "square", peakGain: 0.1 });
    tone(ctx, { freq: 1320, start: now + 0.05, duration: 0.15, type: "sine", peakGain: 0.12 });
  });
}

export function playWhoosh(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 220, endFreq: 70, start: now, duration: 0.45, type: "sawtooth", peakGain: 0.06 });
  });
}

export function playCardFlip(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 500, endFreq: 750, start: now, duration: 0.08, type: "triangle", peakGain: 0.09 });
  });
}

export function playFanfare(): void {
  play((ctx, now) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      tone(ctx, { freq, start: now + i * 0.11, duration: 0.3, type: "triangle", peakGain: 0.14 });
    });
  });
}

export function playChime(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 1046.5, start: now, duration: 0.35, type: "sine", peakGain: 0.13 });
    tone(ctx, { freq: 1568, start: now + 0.05, duration: 0.3, type: "sine", peakGain: 0.09 });
  });
}

export function playPop(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 700, endFreq: 1000, start: now, duration: 0.09, type: "sine", peakGain: 0.13 });
  });
}

export function playCorrect(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 784, start: now, duration: 0.1, type: "sine", peakGain: 0.14 });
    tone(ctx, { freq: 1175, start: now + 0.07, duration: 0.16, type: "sine", peakGain: 0.13 });
  });
}

export function playWrong(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 220, endFreq: 140, start: now, duration: 0.22, type: "sawtooth", peakGain: 0.09 });
  });
}

export function playTick(): void {
  play((ctx, now) => {
    tone(ctx, { freq: 900, start: now, duration: 0.04, type: "square", peakGain: 0.05 });
  });
}

export function playGameOver(): void {
  play((ctx, now) => {
    const notes = [660, 550, 440];
    notes.forEach((freq, i) => {
      tone(ctx, { freq, start: now + i * 0.12, duration: 0.2, type: "triangle", peakGain: 0.11 });
    });
  });
}
