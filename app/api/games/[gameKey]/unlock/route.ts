import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { GAME_KEYS, type GameKey } from "@/lib/reward-engine/gameSession";
import { unlockGame } from "@/lib/reward-engine/gameUnlocks";
import { ServiceError } from "@/lib/student/errors";

function isGameKey(value: string): value is GameKey {
  return (GAME_KEYS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameKey: string }> }) {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { gameKey } = await params;
  if (!isGameKey(gameKey)) {
    return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  }

  try {
    const result = await unlockGame(student.id, gameKey);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
