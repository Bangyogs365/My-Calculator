import { supabase } from "@/lib/supabase";
import { getMyProfile } from "@/lib/profile";
import { hashPin } from "@/lib/crypto/hashPin";

export type GateResult =
  | { status: "opened" }
  | { status: "pin_set"; message: string }
  | { status: "wrong_pin" }
  | { status: "no_session" };

function getOrCreateDeviceId(): string {
  const key = "mycalc_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

async function logAccess(userId: string, action: string, deviceId: string) {
  await supabase.from("calculator_access_logs").insert({
    user_id: userId,
    action,
    device_id: deviceId,
  });
}

/**
 * Dipanggil setiap kali pola "3 digit + + =" terdeteksi di kalkulator.
 * - Kalau user belum pernah set PIN (login_pin_hash null): 3 digit yang
 *   baru saja diketik LANGSUNG dijadikan PIN baru (first-run setup).
 * - Kalau sudah ada PIN: dicocokkan. Cocok → buka dashboard.
 */
export async function handleGateTrigger(pin: string): Promise<GateResult> {
  const profile = await getMyProfile();
  if (!profile) {
    // Belum ada sesi Supabase Auth / profil belum dibuat — kalkulator
    // tetap berfungsi normal, gerbang tidak melakukan apa-apa.
    return { status: "no_session" };
  }

  const deviceId = getOrCreateDeviceId();
  const pinHash = await hashPin(pin);

  if (!profile.login_pin_hash) {
    // First-run: jadikan 3 digit ini sebagai PIN baru.
    const { error } = await supabase
      .from("user_profiles")
      .update({ login_pin_hash: pinHash, pin_updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (error) {
      return { status: "wrong_pin" };
    }
    await logAccess(profile.id, "pin_first_setup", deviceId);
    return { status: "pin_set", message: "Kode akses berhasil dibuat." };
  }

  if (pinHash !== profile.login_pin_hash) {
    await logAccess(profile.id, "pin_fail", deviceId);
    return { status: "wrong_pin" };
  }

  // PIN cocok → catat sesi & buka gerbang
  await supabase.from("app_entry_sessions").upsert(
    {
      user_id: profile.id,
      verified_from_calculator: true,
      session_token: crypto.randomUUID(),
      device_id: deviceId,
      last_verified_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  await supabase.from("app_access_sessions").upsert(
    {
      user_id: profile.id,
      verified_at: new Date().toISOString(),
      last_calculator_entry: new Date().toISOString(),
      device_id: deviceId,
      is_active: true,
    },
    { onConflict: "user_id" }
  );

  await logAccess(profile.id, "pin_success", deviceId);

  sessionStorage.setItem("mycalc_gate_open", "1");
  return { status: "opened" };
}
