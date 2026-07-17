import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateWebhookClient } from "@/lib/auth/webhookAuth";
import { classroomEventSchema } from "@/lib/validation/webhook";
import { processClassroomEvent } from "@/lib/reward-engine/processClassroomEvent";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  const sourceSystem = await authenticateWebhookClient(secret);
  if (!sourceSystem) {
    return NextResponse.json({ error: "Invalid or missing webhook secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = classroomEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const result = await processClassroomEvent({
    sourceSystem,
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
