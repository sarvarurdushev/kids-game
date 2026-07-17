interface ProgressBarProps {
  value: number;
  max: number;
  colorClassName?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  max,
  colorClassName = "bg-gold",
  trackClassName = "bg-ink/10",
}: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full ${trackClassName}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClassName}`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
