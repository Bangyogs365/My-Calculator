"use client";

import { useCallback } from "react";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatRealtime } from "../hooks/useChatRealtime";
import { useSendMessage } from "../hooks/useSendMessage";
import MessageList from "../components/MessageList";
import MessageComposer from "../components/MessageComposer";

export default function ChatRoomScreen({ conversationId }: { conversationId: string }) {
  const { messages, setMessages } = useChatMessages(conversationId);
  const { sendText } = useSendMessage();

  const onRealtimeEvent = useCallback(
    (payload: unknown) => {
      const p = payload as { eventType: string; new: any };
      if (p.eventType === "INSERT") {
        setMessages((prev) => [...prev, p.new]);
      } else if (p.eventType === "UPDATE") {
        setMessages((prev) => prev.map((m) => (m.id === p.new.id ? p.new : m)));
      }
    },
    [setMessages]
  );

  useChatRealtime(conversationId, onRealtimeEvent);

  const handleSend = useCallback(
    async (text: string) => {
      await sendText(conversationId, text);
      // Tidak perlu setMessages manual di sini — INSERT akan masuk lewat
      // realtime subscribe di atas begitu tersimpan di database.
    },
    [conversationId, sendText]
  );

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h1 style={{ padding: 16 }}>Chat Room</h1>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <MessageList messages={messages} />
      </div>
      <MessageComposer onSend={handleSend} />
    </main>
  );
}
