"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getMyProfileId } from "@/lib/profile";

export function useSendMessage() {
  const sendText = useCallback(async (conversationId: string, content: string) => {
    const senderId = await getMyProfileId();
    if (!senderId) {
      return { data: null, error: { message: "Belum login / profil belum ada" } };
    }

    return supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: "text",
      });
  }, []);

  return { sendText };
}
