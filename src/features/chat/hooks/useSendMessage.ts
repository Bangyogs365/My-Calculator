import { supabase } from "@/lib/supabase";

export async function useSendMessage() {
  async function sendText(
    conversationId: string,
    content: string
  ) {
    return await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        content,
        message_type: "text",
      });
  }

  return {
    sendText,
  };
}
