"use client";

import { useRouter } from "next/navigation";
import { useChatList } from "../hooks/useChatList";
import ChatListItemRow from "../components/ChatListItemRow";

export default function ChatListScreen() {
  const router = useRouter();
  const { data: chats, loading, error } = useChatList();

  return (
    <main>
      <h1 style={{ padding: "16px 16px 0" }}>Chat</h1>

      {loading && <p style={{ padding: 16 }}>Memuat…</p>}
      {error && <p style={{ padding: 16, color: "red" }}>{error}</p>}
      {!loading && !error && chats.length === 0 && (
        <p style={{ padding: 16, color: "#777" }}>Belum ada percakapan.</p>
      )}

      {chats.map((chat) => (
        <ChatListItemRow
          key={chat.conversation_id}
          chat={chat}
          onClick={() => router.push(`/dashboard/chat/${chat.conversation_id}`)}
        />
      ))}
    </main>
  );
}
