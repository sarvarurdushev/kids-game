import type { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-3xl bg-white/90 p-5 shadow-lg shadow-ink/5 ${className}`}
    >
      {children}
    </div>
  );
}
