import type { ChatListItem } from "../hooks/useChatList";

export default function ChatListItemRow({
  chat,
  onClick,
}: {
  chat: ChatListItem;
  onClick: () => void;
}) {
  const name = chat.title ?? chat.other_display_name ?? "Tanpa nama";
  const preview =
    chat.last_message_type === "text" || !chat.last_message_type
      ? chat.last_message_content ?? "Belum ada pesan"
      : `[${chat.last_message_type}]`;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: chat.other_avatar_url ? undefined : "#ccc",
          backgroundImage: chat.other_avatar_url ? `url(${chat.other_avatar_url})` : undefined,
          backgroundSize: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{name}</strong>
          {chat.other_is_online && <span style={{ color: "#2ecc71", fontSize: 12 }}>online</span>}
        </div>
        <div
          style={{
            color: "#777",
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {preview}
        </div>
      </div>
      {chat.unread_count > 0 && (
        <div
          style={{
            background: "#25d366",
            color: "#fff",
            borderRadius: "50%",
            minWidth: 20,
            height: 20,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {chat.unread_count}
        </div>
      )}
    </div>
  );
}
