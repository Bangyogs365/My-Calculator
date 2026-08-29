import { supabase } from "@/lib/supabase";

export type MyProfile = {
  id: string;
  auth_user_id: string;
  display_name: string;
  login_pin_hash: string | null;
};

/**
 * Ambil profil (user_profiles) milik user Supabase Auth yang sedang login.
 * Return null kalau belum ada sesi auth, atau profil belum dibuat
 * (mis. baru signup lewat link undangan dan belum panggil
 * signup_with_default_profile).
 */
export async function getMyProfile(): Promise<MyProfile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData.session?.user;
  if (!authUser) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, auth_user_id, display_name, login_pin_hash")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as MyProfile;
}

export async function getMyProfileId(): Promise<string | null> {
  const profile = await getMyProfile();
  return profile?.id ?? null;
}

export async function getProfileById(
  profileId: string,
): Promise<MyProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, auth_user_id, display_name, login_pin_hash")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data as MyProfile;
}

/**
 * Khusus untuk keperluan yang butuh auth.uid() mentah (misalnya path storage
 * bucket chat-media/avatars) — JANGAN dipakai untuk sender_id/user_id di
 * tabel manapun, semua tabel aplikasi pakai profile id (getMyProfileId()).
 */
export async function getMyAuthUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
