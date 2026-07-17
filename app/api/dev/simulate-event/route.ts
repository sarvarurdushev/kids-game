import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { classroomEventSchema } from "@/lib/validation/webhook";
import { processClassroomEvent } from "@/lib/reward-engine/processClassroomEvent";
import { z } from "zod";

// Local-only convenience wrapper around the real webhook, for exercising the
// reward engine end-to-end before any real classroom-AI system is wired up.
// Refuses to run in production regardless of what secret is supplied.
const devSimulateEventSchema = classroomEventSchema.extend({
  source_system: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const providedSecret = request.headers.get("x-dev-secret");
  if (!providedSecret || providedSecret !== process.env.DEV_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid dev secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = devSimulateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const result = await processClassroomEvent({
    sourceSystem: data.source_system,
    externalEventId: data.external_event_id ?? null,
    studentExternalId: data.student_external_id,
    program: data.program ?? null,
    metrics: {
      attendance: data.attendance,
      participationScore: data.participation_score,
      speakingScore: data.speaking_score,
      confidenceScore: data.confidence_score,
      teamworkScore: data.teamwork_score,
      engagementScore: data.engagement_score,
      behaviorScore: data.behavior_score,
      activityCompleted: data.activity_completed,
    },
    rawPayload: data,
  });

  const status = result.status === "unresolved_student" ? 422 : 200;
  return NextResponse.json(result, { status });
}
