"use client";

import { supabase } from "@/lib/supabase";
import { logCalculatorAccess } from "./accessLog";

const SESSION_KEY = "mycalc_session";
const DEVICE_KEY = "mycalc_device_id";
const GATE_KEY = "mycalc_gate_open";

export type EntrySession = {
  profileId: string;
  deviceId: string;
  sessionToken: string;
  createdAt: string;
};

function requireBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("Sesi perangkat hanya tersedia di browser");
  }
}

export function getDeviceId(): string {
  requireBrowser();

  let deviceId = window.localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, deviceId);
  }

  return deviceId;
}

export function createSession(
  profileId: string,
  sessionToken = crypto.randomUUID(),
): EntrySession {
  requireBrowser();

  const session: EntrySession = {
    profileId,
    deviceId: getDeviceId(),
    sessionToken,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.sessionStorage.setItem(GATE_KEY, "1");
  return session;
}

export function getSession(): EntrySession | null {
  if (typeof window === "undefined") return null;

  const data = window.localStorage.getItem(SESSION_KEY);
  if (!data) return null;

  try {
    const session = JSON.parse(data) as Partial<EntrySession>;
    if (!session.profileId || !session.deviceId) return null;

    return {
      profileId: session.profileId,
      deviceId: session.deviceId,
      sessionToken: session.sessionToken ?? "",
      createdAt: session.createdAt ?? "",
    };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(GATE_KEY);
}

export function isGateOpen(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(GATE_KEY) === "1";
}

/**
 * Menyimpan seluruh jejak entry di backend sebelum gerbang dashboard dibuka.
 */
export async function recordSuccessfulEntry(
  profileId: string,
): Promise<EntrySession> {
  const deviceId = getDeviceId();
  const sessionToken = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error: entryError } = await supabase
    .from("app_entry_sessions")
    .insert({
      user_id: profileId,
      verified_from_calculator: true,
      session_token: sessionToken,
      device_id: deviceId,
      last_verified_at: now,
    });
  if (entryError) throw entryError;

  const { data: existing, error: lookupError } = await supabase
    .from("app_access_sessions")
    .select("id")
    .eq("user_id", profileId)
    .eq("device_id", deviceId)
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) throw lookupError;

  const accessPayload = {
    user_id: profileId,
    verified_at: now,
    last_calculator_entry: now,
    device_id: deviceId,
    is_active: true,
  };

  const { error: accessError } = existing
    ? await supabase
        .from("app_access_sessions")
        .update(accessPayload)
        .eq("id", existing.id)
    : await supabase.from("app_access_sessions").insert(accessPayload);
  if (accessError) throw accessError;

  await logCalculatorAccess(profileId, "pin_success", deviceId);
  return createSession(profileId, sessionToken);
}
