"use client";

// Procedurally generated ambient background music — the melodic sibling of
// lib/sound.ts's sound effects, built the same way: short tones synthesized
// at runtime via the raw Web Audio API, no audio files, nothing to load or
// fail to load.
//
// It deliberately inverts sound.ts's default, though. Sound *effects* are
// muted by default (a kids' app making noise unasked is disruptive) — but
// the app's owner explicitly asked for continuous background music instead:
// "without music, it is too boring... there must be music playing all the
// time." So music defaults to ON, with an independent mute switch (see
// isMusicMuted/setMusicMuted below) for whoever wants quiet.
//
// "Different music" is handled two ways:
//   1. Area-based themes — the active theme follows which part of the app
//      you're in (see MUSIC_THEMES / areaForPathname): a calm theme for
//      home/room/avatar/etc., a more upbeat one for the game arcade, and a
//      shimmery one for opening packs/cases.
//   2. Session variety — the calm "base" area has two interchangeable
//      variants (cozyA/cozyB); one is picked at random each time the engine
//      starts (i.e. once per session/page-load), so returning students don't
//      hear the identical loop every single time.
//
// Playback timing uses a classic "look-ahead" scheduler (see Chris Wilson's
// "A Tale of Two Clocks"): a setInterval timer wakes up periodically purely
// to check the clock; it never triggers a note directly. Every note's actual
// start/stop time is computed from and handed to the AudioContext's own
// sample-accurate clock (ctx.currentTime + osc.start(t)/stop(t)), scheduled
// a little ahead of when it's needed. That means the timer's own jitter (or
// a delayed callback from other main-thread work) never shows up as audible
// drift or gaps — only the Web Audio clock determines when sound happens.
//
// Volume: every voice's peakGain below is authored directly in the
// 0.02–0.035 range — clearly under sound.ts's effect volumes (~0.05–0.15) —
// so the music sits underneath coin chimes / correct-answer dings / etc.
// without masking them. The shared masterGain node is used only as an
// on/off (mute) switch, not an extra volume knob, so those authored values
// are the true output level.
//
// CPU/battery: each theme uses at most 3 voices, simple oscillator types
// (sine/triangle/square, no filters/effects chains), and modest tempos
// (68–128bpm) — a small, cheap arrangement meant to run continuously on a
// phone for as long as the app is open.

import { getAudioContext } from "./sound";

const MUTE_KEY = "gk_music_muted";
const MUTE_EVENT = "gk-music-mute-change";

export function isMusicMuted(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(MUTE_KEY);
  // Opposite default from sound.ts's isSoundMuted: music is ON unless a
  // student/parent has explicitly turned it off.
  return stored === "true";
}

export function setMusicMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, String(muted));
  window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: muted }));
}

export function onMusicMuteChange(listener: (muted: boolean) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (e: Event) => listener((e as CustomEvent<boolean>).detail);
  window.addEventListener(MUTE_EVENT, handler);
  return () => window.removeEventListener(MUTE_EVENT, handler);
}

// ---------------------------------------------------------------------------
// Note/theme authoring
// ---------------------------------------------------------------------------

const NOTE_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

/** Scientific pitch notation ("C4", "F#3", ...) -> frequency in Hz (A4 = 440). */
function noteFreq(name: string): number {
  const match = /^([A-G]#?)(-?\d+)$/.exec(name);
  if (!match) return 440;
  const [, letter, octaveStr] = match;
  const midi = NOTE_SEMITONE[letter] + (Number(octaveStr) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface MusicNote {
  freq: number;
  /** Offset from the start of the loop, in beats. */
  beat: number;
  /** Length of this note, in beats. */
  beats: number;
}

/** Authoring shorthand: a melodic note by name rather than raw Hz. */
function n(note: string, beat: number, beats: number): MusicNote {
  return { freq: noteFreq(note), beat, beats };
}

interface MusicVoice {
  type: OscillatorType;
  peakGain: number;
  /** Seconds from note-start to peak volume — bigger = softer pad-like entry. */
  attack: number;
  notes: MusicNote[];
}

interface MusicTheme {
  label: string;
  bpm: number;
  /** Total loop length, in beats (loop repeats seamlessly forever). */
  loopBeats: number;
  voices: MusicVoice[];
}

type ThemeKey = "cozyA" | "cozyB" | "arcade" | "treasure";
export type MusicArea = "base" | "arcade" | "treasure";

// Four themes, each with a distinct scale/progression, tempo, and
// oscillator-type "instrumentation" so the loops feel different from one
// another rather than like one static track everywhere:
//
//   cozyA / cozyB — calm, warm, slow (home, room, avatar, and the rest of
//     the app not covered below). Two interchangeable variants so a
//     returning student doesn't hear the exact same loop every session.
//   arcade — brighter, faster, more energetic (the game arcade).
//   treasure — sparkly, major-key and slightly mysterious (opening
//     packs/cases — a little "reveal" moment).
const MUSIC_THEMES: Record<ThemeKey, MusicTheme> = {
  cozyA: {
    label: "Meadow (calm)",
    bpm: 74,
    loopBeats: 16, // 4 bars of I - vi - IV - V in C major
    voices: [
      {
        // Root note, held for the whole bar.
        type: "sine",
        peakGain: 0.026,
        attack: 0.4,
        notes: [n("C4", 0, 4), n("A3", 4, 4), n("F3", 8, 4), n("G3", 12, 4)],
      },
      {
        // Fifth above the root, entering a hair late for a soft, breathy pad.
        type: "sine",
        peakGain: 0.02,
        attack: 0.5,
        notes: [n("G4", 0.5, 3.25), n("E4", 4.5, 3.25), n("C5", 8.5, 3.25), n("D5", 12.5, 3.25)],
      },
      {
        // Gentle half-note bass pulse, one octave below the pad root.
        type: "triangle",
        peakGain: 0.03,
        attack: 0.03,
        notes: [
          n("C3", 0, 2), n("C3", 2, 2),
          n("A2", 4, 2), n("A2", 6, 2),
          n("F2", 8, 2), n("F2", 10, 2),
          n("G2", 12, 2), n("G2", 14, 2),
        ],
      },
    ],
  },
  cozyB: {
    label: "Lullaby (calm, alt.)",
    bpm: 68,
    loopBeats: 16, // 4 bars of i - VI - III - VII in A minor — same family as
    // cozyA but a different scale/progression/tempo/timbre so it's clearly
    // a different piece, not a re-skin.
    voices: [
      {
        type: "triangle",
        peakGain: 0.024,
        attack: 0.4,
        notes: [n("A3", 0, 4), n("F3", 4, 4), n("C4", 8, 4), n("G3", 12, 4)],
      },
      {
        type: "sine",
        peakGain: 0.02,
        attack: 0.5,
        notes: [n("E4", 0.5, 3.25), n("C5", 4.5, 3.25), n("G4", 8.5, 3.25), n("D5", 12.5, 3.25)],
      },
      {
        type: "sine",
        peakGain: 0.028,
        attack: 0.03,
        notes: [
          n("A2", 0, 2), n("A2", 2, 2),
          n("F2", 4, 2), n("F2", 6, 2),
          n("C3", 8, 2), n("C3", 10, 2),
          n("G2", 12, 2), n("G2", 14, 2),
        ],
      },
    ],
  },
  arcade: {
    label: "Arcade (upbeat)",
    bpm: 128,
    loopBeats: 8, // 2 bars: C major, then G major, alternating
    voices: [
      {
        // Bouncy eighth-note arpeggio (root-3rd-5th-3rd, twice per bar).
        type: "square",
        peakGain: 0.026,
        attack: 0.01,
        notes: [
          n("C5", 0, 0.4), n("E5", 0.5, 0.4), n("G5", 1, 0.4), n("E5", 1.5, 0.4),
          n("C5", 2, 0.4), n("E5", 2.5, 0.4), n("G5", 3, 0.4), n("E5", 3.5, 0.4),
          n("G4", 4, 0.4), n("B4", 4.5, 0.4), n("D5", 5, 0.4), n("B4", 5.5, 0.4),
          n("G4", 6, 0.4), n("B4", 6.5, 0.4), n("D5", 7, 0.4), n("B4", 7.5, 0.4),
        ],
      },
      {
        // Steady quarter-note bass, one chord root per bar.
        type: "triangle",
        peakGain: 0.032,
        attack: 0.01,
        notes: [
          n("C3", 0, 0.9), n("C3", 1, 0.9), n("C3", 2, 0.9), n("C3", 3, 0.9),
          n("G2", 4, 0.9), n("G2", 5, 0.9), n("G2", 6, 0.9), n("G2", 7, 0.9),
        ],
      },
      {
        // A quick, unpitched-feeling high blip on the off-beats — just enough
        // rhythmic "energy" for an arcade feel without adding harmonic clutter.
        type: "square",
        peakGain: 0.016,
        attack: 0.005,
        notes: Array.from({ length: 8 }, (_, i) => ({ freq: 1400, beat: i + 0.5, beats: 0.08 })),
      },
    ],
  },
  treasure: {
    label: "Treasure (shimmery)",
    bpm: 96,
    loopBeats: 16, // 4 bars of I - V - vi - IV in C major, an upbeat/"reveal" progression
    voices: [
      {
        type: "sine",
        peakGain: 0.024,
        attack: 0.5,
        notes: [n("C4", 0, 4), n("G3", 4, 4), n("A3", 8, 4), n("F3", 12, 4)],
      },
      {
        // A quick ascending sparkle at the start of each bar.
        type: "triangle",
        peakGain: 0.02,
        attack: 0.02,
        notes: [
          n("C5", 0, 0.3), n("E5", 0.33, 0.3), n("G5", 0.66, 0.3),
          n("G4", 4, 0.3), n("B4", 4.33, 0.3), n("D5", 4.66, 0.3),
          n("A4", 8, 0.3), n("C5", 8.33, 0.3), n("E5", 8.66, 0.3),
          n("F4", 12, 0.3), n("A4", 12.33, 0.3), n("C5", 12.66, 0.3),
        ],
      },
      {
        type: "sine",
        peakGain: 0.03,
        attack: 0.05,
        notes: [n("C3", 0, 4), n("G2", 4, 4), n("A2", 8, 4), n("F2", 12, 4)],
      },
    ],
  },
};

/** Which broad area of the app a pathname belongs to, for theme-switching. */
export function areaForPathname(pathname: string): MusicArea {
  if (pathname.startsWith("/games")) return "arcade";
  if (pathname.startsWith("/cases") || pathname.startsWith("/packs")) return "treasure";
  return "base";
}

// ---------------------------------------------------------------------------
// Scheduler
// ---------------------------------------------------------------------------

// How far ahead (in seconds) of "now" the scheduler is willing to queue up
// the next loop iteration. Kept short (comfortably longer than one timer
// tick) so theme switches are noticed promptly, but long enough that a
// slightly-late timer tick never causes an audible gap.
const LOOKAHEAD_SEC = 0.2;
// How often the timer wakes up just to check the clock. This is the only
// setInterval in the engine, and it never schedules audio directly off its
// own firing time — see file header.
const SCHEDULER_INTERVAL_MS = 100;
// If the scheduler somehow falls this far behind ctx.currentTime (e.g. a
// backgrounded/throttled tab), don't burst through every missed loop
// iteration when the tab wakes up — just resync to "now."
const MAX_CATCH_UP_SEC = 1.5;

function scheduleTone(
  ctx: AudioContext,
  destination: AudioNode,
  opts: { freq: number; start: number; duration: number; type: OscillatorType; peakGain: number; attack: number }
) {
  const { freq, start, duration, type, peakGain, attack } = opts;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function scheduleThemeLoop(ctx: AudioContext, destination: AudioNode, theme: MusicTheme, loopStart: number) {
  const beatSec = 60 / theme.bpm;
  for (const voice of theme.voices) {
    for (const note of voice.notes) {
      scheduleTone(ctx, destination, {
        freq: note.freq,
        start: loopStart + note.beat * beatSec,
        duration: note.beats * beatSec,
        type: voice.type,
        peakGain: voice.peakGain,
        attack: voice.attack,
      });
    }
  }
}

function loopDurationSec(theme: MusicTheme): number {
  return Math.max(0.5, (theme.loopBeats * 60) / theme.bpm);
}

class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private nextLoopStart = 0;
  private running = false;
  private area: MusicArea = "base";
  private baseVariant: ThemeKey = "cozyA";
  private unsubscribeMute: (() => void) | null = null;

  setArea(area: MusicArea): void {
    this.area = area;
  }

  private activeTheme(): MusicTheme {
    const key: ThemeKey = this.area === "base" ? this.baseVariant : this.area;
    return MUSIC_THEMES[key];
  }

  private tick = (): void => {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    if (this.nextLoopStart < ctx.currentTime - MAX_CATCH_UP_SEC) {
      this.nextLoopStart = ctx.currentTime + 0.05;
    }
    while (this.nextLoopStart < ctx.currentTime + LOOKAHEAD_SEC) {
      // Reading activeTheme() fresh on every iteration means a mid-playback
      // area/theme change (e.g. the student navigated to a different part of
      // the app) takes effect at the next loop boundary rather than cutting
      // the current phrase off mid-note — a deliberate, small hand-off delay
      // (at most one loop length) in exchange for no clicks/abrupt cuts. It
      // also means there is only ever one loop iteration boundary being
      // decided at a time, so two themes can never end up layered/fighting.
      const theme = this.activeTheme();
      scheduleThemeLoop(ctx, this.masterGain, theme, this.nextLoopStart);
      this.nextLoopStart += loopDurationSec(theme);
    }
  };

  /** Idempotent: safe to call from every click/keypress handler and from
   * React StrictMode's double-invoked effects — only the first call after a
   * stop() actually starts anything. */
  start(): void {
    if (this.running) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    this.ctx = ctx;
    this.baseVariant = Math.random() < 0.5 ? "cozyA" : "cozyB";
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isMusicMuted() ? 0 : 1, ctx.currentTime);
    gain.connect(ctx.destination);
    this.masterGain = gain;
    this.nextLoopStart = ctx.currentTime + 0.05;
    this.running = true;
    this.tick();
    this.timerId = setInterval(this.tick, SCHEDULER_INTERVAL_MS);
    this.unsubscribeMute = onMusicMuteChange((muted) => this.applyMute(muted));
  }

  private applyMute(muted: boolean): void {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.25);
  }

  /** Full teardown — not currently called by the app (the provider that
   * starts the engine lives at the root layout and never unmounts), but kept
   * for correctness/tests rather than leaving an orphaned interval. */
  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.unsubscribeMute) {
      this.unsubscribeMute();
      this.unsubscribeMute = null;
    }
    this.masterGain?.disconnect();
    this.masterGain = null;
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}

const engine = new MusicEngine();

/** Update which theme should play, based on the current route. Safe to call
 * before the engine has started (e.g. on first mount, before any user
 * gesture) — the choice just takes effect once start() runs. */
export function setActiveMusicArea(pathname: string): void {
  engine.setArea(areaForPathname(pathname));
}

/** Start the loop. Must be called synchronously from within a user-gesture
 * event handler (click/tap/keydown) the first time, per browser
 * autoplay-with-sound policy — see MusicProvider. */
export function startMusicEngine(): void {
  engine.start();
}

export function stopMusicEngine(): void {
  engine.stop();
}

export function isMusicEngineRunning(): boolean {
  return engine.isRunning();
}

// Exported for tests only.
export const __internal = { noteFreq, MUSIC_THEMES };
