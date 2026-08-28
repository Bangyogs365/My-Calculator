import { supabase } from "@/lib/supabase";

/**
 * PENTING: parameter `authUserId` HARUS berasal dari `supabase.auth.getSession()`
 * (auth.uid()), BUKAN dari `user_profiles.id` (profile id). RLS storage bucket
 * "chat-media" mensyaratkan folder pertama di path == auth.uid() persis —
 * kalau dikirim profile id, upload akan selalu ditolak (403).
 *
 * Contoh pemanggilan yang benar:
 *   const { data: { session } } = await supabase.auth.getSession();
 *   await uploadChatMedia(file, session.user.id);
 */
export async function uploadChatMedia(
  file: File,
  authUserId: string
) {
  const path = `${authUserId}/${Date.now()}-${file.name}`;

  const result = await supabase.storage
    .from("chat-media")
    .upload(path, file);

  return result;
}
