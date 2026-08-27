import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useChatRealtime(
  conversationId: string | undefined,
  onMessage: (payload: unknown) => void
) {
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        onMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onMessage]);
}
