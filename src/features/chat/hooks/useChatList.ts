import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getMyProfileId } from "@/lib/profile";

export type ChatListItem = {
  conversation_id: string;
  conversation_type: string;
  title: string | null;
  is_private: boolean;
  other_user_id: string | null;
  other_display_name: string | null;
  other_username: string | null;
  other_avatar_url: string | null;
  other_is_online: boolean | null;
  other_last_seen: string | null;
  last_message_content: string | null;
  last_message_type: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  last_message_status: string | null;
  unread_count: number;
};

export function useChatList() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const profileId = await getMyProfileId();

    if (!profileId) {
      setError("Belum login / profil belum ada");
      setChats([]);
      setLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc("get_chat_list_v2", {
      p_user_id: profileId,
    });

    if (rpcError) {
      setError(rpcError.message);
      setChats([]);
    } else {
      setError(null);
      setChats((data ?? []) as ChatListItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { chats, loading, error, reload };
}
