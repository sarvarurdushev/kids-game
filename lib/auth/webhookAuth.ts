import "server-only";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { webhookClients } from "@/lib/db/schema";

// Webhook secrets are long, high-entropy random tokens (unlike a child's PIN),
// so a fast indexed hash lookup is the right tradeoff — no need for a
// memory-hard KDF here.
export function hashWebhookSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

/** Returns the matching client's source_system, or null if the secret doesn't match any active client. */
export async function authenticateWebhookClient(
  secret: string | null
): Promise<string | null> {
  if (!secret) return null;
  const hash = hashWebhookSecret(secret);
  const [client] = await db
    .select({ sourceSystem: webhookClients.sourceSystem })
    .from(webhookClients)
    .where(and(eq(webhookClients.secretHash, hash), eq(webhookClients.active, true)))
    .limit(1);
  return client?.sourceSystem ?? null;
}
