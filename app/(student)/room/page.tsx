import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAvatarItems, getEquippedAvatarKeys } from "@/lib/student/avatar";
import { getRoomSetShop } from "@/lib/student/roomSets";
import { RoomCustomizer } from "@/components/room/RoomCustomizer";
import type { RoomItem } from "@/components/room/RoomCustomizer";

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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Your Room</h1>
        <Link href="/avatar" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
          Edit avatar →
        </Link>
      </div>
      <RoomCustomizer items={items} roomSets={roomSets} coinsBalance={student.coinsBalance} equippedKeys={equippedKeys} />
    </div>
  );
}
