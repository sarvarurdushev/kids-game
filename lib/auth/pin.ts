import "server-only";
import { hash, verify } from "@node-rs/argon2";

export async function hashPin(pin: string): Promise<string> {
  return hash(pin);
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return verify(pinHash, pin);
}
