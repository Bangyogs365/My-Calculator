import { supabase } from "@/lib/supabase";

export async function uploadChatMedia(
  file: File,
  userId: string
) {
  const path = `${userId}/${Date.now()}-${file.name}`;

  const result = await supabase.storage
    .from("chat-media")
    .upload(path, file);

  return result;
}
