import { BoosterPackIcon } from "@/components/icons";

interface PackCardProps {
  name: string;
  subtitle?: string;
  color?: string;
}

export function PackCard({ name, subtitle, color }: PackCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <BoosterPackIcon size={72} color={color} />
      <p className="font-display font-semibold">{name}</p>
      {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
    </div>
  );
}
