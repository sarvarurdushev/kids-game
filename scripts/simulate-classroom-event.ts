import "./_env";
import { randomUUID } from "node:crypto";

// Local convenience CLI for exercising the reward engine end-to-end without a
// real classroom-AI integration. Posts to /api/dev/simulate-event, which
// requires `npm run dev` to be running and only works outside production.
//
// Usage:
//   npm run simulate-event -- --student demo-amira --attendance true --participation 85 --speaking 90 --teamwork 75
//   npm run simulate-event -- --student demo-amira --activity-completed true --program discovery --repeat 10

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = value;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const studentExternalId = args.student;
  if (!studentExternalId) {
    console.error(
      'Usage: npm run simulate-event -- --student <external-id> [--attendance true] [--participation 85] [--speaking 90] [--teamwork 75] [--program discovery] [--activity-completed true] [--repeat 1]'
    );
    process.exitCode = 1;
    return;
  }

  const baseUrl = args.url ?? "http://localhost:3000";
  const sourceSystem = args.source ?? "goldenkids";
  const secret = args.secret ?? process.env.DEV_WEBHOOK_SECRET;
  if (!secret) {
    console.error("No dev secret provided. Set DEV_WEBHOOK_SECRET in .env.local or pass --secret.");
    process.exitCode = 1;
    return;
  }

  const repeat = Number(args.repeat ?? "1");

  const payload: Record<string, unknown> = {
    source_system: sourceSystem,
    student_external_id: studentExternalId,
  };
  if (args.program) payload.program = args.program;
  if (args.attendance) payload.attendance = args.attendance === "true";
  if (args.participation) payload.participation_score = Number(args.participation);
  if (args.speaking) payload.speaking_score = Number(args.speaking);
  if (args.confidence) payload.confidence_score = Number(args.confidence);
  if (args.teamwork) payload.teamwork_score = Number(args.teamwork);
  if (args.engagement) payload.engagement_score = Number(args.engagement);
  if (args.behavior) payload.behavior_score = Number(args.behavior);
  if (args["activity-completed"]) payload.activity_completed = args["activity-completed"] === "true";

  for (let i = 0; i < repeat; i++) {
    const eventPayload = { ...payload, external_event_id: args["event-id"] ?? randomUUID() };
    const res = await fetch(`${baseUrl}/api/dev/simulate-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dev-secret": secret,
      },
      body: JSON.stringify(eventPayload),
    });
    const data = await res.json().catch(() => ({}));
    console.log(`[${i + 1}/${repeat}] ${res.status}`, JSON.stringify(data, null, 2));
    if (!res.ok) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
