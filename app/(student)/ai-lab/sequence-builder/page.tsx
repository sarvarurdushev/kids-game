import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isAgeTrack } from "@/lib/ai-lab/curriculum";
import { SequenceBuilder } from "@/components/games/SequenceBuilder";

export default async function SequenceBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const { track: trackParam } = await searchParams;
  const track = isAgeTrack(trackParam) ? trackParam : "little_sparks";
  const equippedKeys = await getEquippedAvatarKeys(student);

  return <SequenceBuilder equippedKeys={equippedKeys} track={track} />;
}
