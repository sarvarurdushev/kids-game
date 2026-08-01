import "./_env";
import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students, studentAvatarItems, studentExternalRefs, roomPlacements } from "@/lib/db/schema";
import { hashPin } from "@/lib/auth/pin";

// Staff-run CLI for enrolling a new student. There's no admin UI for this in
// Phase 1 (no parent/teacher portal yet), so this script is the only way to
// create an account.
//
// Usage:
//   npm run create-student -- --name "Layla" [--pin 1234] [--source goldenkids] [--external-id ext-123]

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

function randomEnrollmentCode(name: string): string {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 6).toUpperCase() || "KID";
  return `GOLD-${prefix}-${suffix}`;
}

// Grants the starter item a display spot at the lowest free position in its
// slot, same rule (and same per-slot caps) as lib/student/roomPlacements.ts's
// placeItem/ROOM_PLACEMENT_CAP. A no-op if it's already placed or that slot
// is already full — matches the "silently skip, don't fail" best-effort rule
// used everywhere else placement is auto-attempted (mirrors scripts/seed.ts's
// identical helper).
const STARTER_PLACEMENT_CAP: Record<string, number> = { furniture: 4, furniture_small: 3 };
async function placeStarterFurniture(studentId: string, item: { id: string; slot: string }) {
  if (item.slot !== "furniture" && item.slot !== "furniture_small") return;
  const slot = item.slot;
  const existing = await db
    .select()
    .from(roomPlacements)
    .where(sql`${roomPlacements.studentId} = ${studentId} and ${roomPlacements.slot} = ${slot}`);
  if (existing.some((p) => p.avatarItemId === item.id)) return;
  const taken = new Set(existing.map((p) => p.position));
  let position = -1;
  for (let i = 0; i < STARTER_PLACEMENT_CAP[slot]; i++) {
    if (!taken.has(i)) {
      position = i;
      break;
    }
  }
  if (position === -1) return;
  await db
    .insert(roomPlacements)
    .values({ studentId, avatarItemId: item.id, slot, position })
    .onConflictDoNothing();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args.name;
  if (!name) {
    console.error('Usage: npm run create-student -- --name "Layla" [--pin 1234] [--source goldenkids] [--external-id ext-123]');
    process.exitCode = 1;
    return;
  }

  const pin = args.pin ?? randomPin();
  const enrollmentCode = args.code ?? randomEnrollmentCode(name);
  const pinHash = await hashPin(pin);

  const [student] = await db
    .insert(students)
    .values({ displayName: name, enrollmentCode, pinHash })
    .returning();

  if (args.source && args["external-id"]) {
    await db.insert(studentExternalRefs).values({
      studentId: student.id,
      sourceSystem: args.source,
      externalId: args["external-id"],
    });
  }

  const starterItems = await db.query.avatarItems.findMany({
    where: (item, { eq: eqOp }) => eqOp(item.acquisitionMethod, "starter"),
  });
  const equipped: Record<string, string> = {};
  for (const item of starterItems) {
    await db.insert(studentAvatarItems).values({
      studentId: student.id,
      avatarItemId: item.id,
      acquiredVia: "starter",
    });
    // furniture/furniture_small are multi-select (room_placements), not a
    // single equipped column — give the starter item a display spot instead
    // of trying to set a now-nonexistent equipped*Id column (which
    // db.update().set() would silently drop, leaving the room empty).
    if (item.slot === "furniture" || item.slot === "furniture_small") {
      await placeStarterFurniture(student.id, item);
    } else {
      equipped[`equipped${toPascalCase(item.slot)}Id`] = item.id;
    }
  }
  if (Object.keys(equipped).length > 0) {
    await db.update(students).set(equipped).where(eq(students.id, student.id));
  }

  console.log("Student created:");
  console.log(`  name: ${student.displayName}`);
  console.log(`  enrollment code: ${enrollmentCode}`);
  console.log(`  PIN: ${pin}`);
  if (args.source && args["external-id"]) {
    console.log(`  linked to ${args.source}:${args["external-id"]}`);
  }
}

// Matches the students table's camelCase equipped*Id columns, e.g.
// "furniture_small" -> "FurnitureSmall" -> equippedFurnitureSmallId.
// A plain capitalize() of the first letter only worked while every slot was
// a single word; snake_case slots (furniture_small, furniture_wall) need
// each underscore-separated part capitalized.
function toPascalCase(slot: string): string {
  return slot
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
