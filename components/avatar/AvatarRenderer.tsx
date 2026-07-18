import { AvatarCharacter, type AvatarEquippedKeys, type AvatarMood } from "./AvatarCharacter";

interface AvatarRendererProps {
  equippedKeys: AvatarEquippedKeys;
  size?: number;
  mood?: AvatarMood;
  animated?: boolean;
  className?: string;
}

export function AvatarRenderer({ equippedKeys, size = 96, mood, animated, className }: AvatarRendererProps) {
  return (
    <AvatarCharacter
      equippedKeys={equippedKeys}
      size={size}
      mood={mood}
      animated={animated}
      className={className}
    />
  );
}
