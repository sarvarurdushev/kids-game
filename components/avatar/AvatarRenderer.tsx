import { emojiForAvatarItem } from "@/lib/visuals";

interface AvatarRendererProps {
  equippedKeys: Partial<
    Record<"hair" | "eyes" | "clothes" | "hat" | "accessory" | "background", string>
  >;
  size?: number;
}

export function AvatarRenderer({ equippedKeys, size = 96 }: AvatarRendererProps) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-teal/30 shadow-inner"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }}>
        {equippedKeys.clothes ? emojiForAvatarItem(equippedKeys.clothes) : "🧒"}
      </span>
      {equippedKeys.hat && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          style={{ fontSize: size * 0.35 }}
        >
          {emojiForAvatarItem(equippedKeys.hat)}
        </span>
      )}
      {equippedKeys.accessory && (
        <span className="absolute right-0 bottom-0" style={{ fontSize: size * 0.25 }}>
          {emojiForAvatarItem(equippedKeys.accessory)}
        </span>
      )}
    </div>
  );
}
