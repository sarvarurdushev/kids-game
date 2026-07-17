"use client";

import { useState } from "react";

interface PinPadProps {
  length?: number;
  onSubmit: (pin: string) => void;
  error?: string | null;
  disabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinPad({ length = 4, onSubmit, error, disabled }: PinPadProps) {
  const [pin, setPin] = useState("");

  function press(digit: string) {
    if (disabled) return;
    const next = (pin + digit).slice(0, length);
    setPin(next);
    if (next.length === length) {
      onSubmit(next);
      setPin("");
    }
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${error ? "gk-shake" : ""}`}>
      <div className="flex gap-3">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-gold ${
              i < pin.length ? "bg-gold" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      {error && <p className="text-sm font-semibold text-coral">{error}</p>}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => (key === "⌫" ? backspace() : press(key))}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
