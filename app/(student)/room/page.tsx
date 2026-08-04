import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAvatarItems, getEquippedAvatarKeys } from "@/lib/student/avatar";
import { getRoomSetShop } from "@/lib/student/roomSets";
import { RoomCustomizer } from "@/components/room/RoomCustomizer";
import type { RoomItem } from "@/components/room/RoomCustomizer";
import { RoomHeader } from "@/components/room/RoomHeader";

const ROOM_SLOTS = new Set<string>(["wallpaper", "floor", "furniture", "furniture_small", "furniture_wall"]);

export default async function RoomPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const items = (await getAvatarItems(student)).filter((item) =>
    ROOM_SLOTS.has(item.slot)
  ) as RoomItem[];
  const equippedKeys = await getEquippedAvatarKeys(student);
  const roomSets = await getRoomSetShop(student.id);

  return (
    <div className="flex flex-col gap-5">
      <RoomHeader />
      <RoomCustomizer items={items} roomSets={roomSets} coinsBalance={student.coinsBalance} equippedKeys={equippedKeys} />
    </div>
  );
}
