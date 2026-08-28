import { supabase } from "@/lib/supabase";
import { getMyProfileId } from "@/lib/profile";

export async function useSendMessage() {
  async function sendText(
    conversationId: string,
    content: string
  ) {
    const senderId = await getMyProfileId();
    if (!senderId) {
      return { data: null, error: { message: "Belum login / profil belum ada" } };
    }

    return await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: "text",
      });
  }

  return {
    sendText,
  };
}
