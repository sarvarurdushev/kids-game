import "./_env";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { hashPin } from "@/lib/auth/pin";

// Staff-run CLI PIN reset — there's no self-service "forgot PIN" flow in
// Phase 1 (no parent portal yet). Also bumps token_version, which
// invalidates any outstanding session cookies for this student.
//
// Usage:
//   npm run reset-pin -- --code GOLD-AMIRA [--pin 5678]

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

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const code = args.code;
  if (!code) {
    console.error("Usage: npm run reset-pin -- --code GOLD-AMIRA [--pin 5678]");
    process.exitCode = 1;
    return;
  }

  const [student] = await db.select().from(students).where(eq(students.enrollmentCode, code)).limit(1);
  if (!student) {
    console.error(`No student found with enrollment code "${code}"`);
    process.exitCode = 1;
    return;
  }

  const pin = args.pin ?? randomPin();
  const pinHash = await hashPin(pin);

  await db
    .update(students)
    .set({
      pinHash,
      pinLockedUntil: null,
      tokenVersion: student.tokenVersion + 1,
      updatedAt: new Date(),
    })
    .where(eq(students.id, student.id));

  console.log(`PIN reset for ${student.displayName} (${code}): new PIN is ${pin}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
