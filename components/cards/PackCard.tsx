interface PackCardProps {
  name: string;
  subtitle?: string;
  emoji?: string;
}

export function PackCard({ name, subtitle, emoji = "🎁" }: PackCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-gold/20 to-coral/20 p-4 text-center">
      <div className="text-5xl">{emoji}</div>
      <p className="font-display font-semibold">{name}</p>
      {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
    </div>
  );
}
