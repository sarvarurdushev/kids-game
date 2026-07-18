import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { completeGameSession, GAME_KEYS, type GameKey } from "@/lib/reward-engine/gameSession";
import { completeGameSessionSchema } from "@/lib/validation/actions";

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

  const body = await request.json().catch(() => null);
  const parsed = completeGameSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await completeGameSession(
    student.id,
    gameKey,
    parsed.data.correctCount,
    parsed.data.totalCount,
    parsed.data.score
  );
  return NextResponse.json(result);
}
