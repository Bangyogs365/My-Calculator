"use client";

import { hashPin } from "@/lib/crypto/hashPin";

export async function verifyPin(
  input: string,
  storedHash: string | null | undefined,
): Promise<boolean> {
  if (!/^\d{3}$/.test(input) || !storedHash) return false;
  return (await hashPin(input)) === storedHash;
}
