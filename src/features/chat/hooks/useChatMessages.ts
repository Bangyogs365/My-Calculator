import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useChatMessages(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(data ?? []);
    }

    loadMessages();
  }, [conversationId]);

  return {
    messages,
    setMessages,
  };
}
