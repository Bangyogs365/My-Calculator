"use client";

import { useState, useCallback } from "react";

export default function MessageComposer({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }, [text, onSend]);

  return (
    <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #eee" }}>
      <button>+</button>
      <input
        style={{ flex: 1 }}
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      {text.trim() ? (
        <button onClick={submit}>Kirim</button>
      ) : (
        <button>🎤</button>
      )}
    </div>
  );
}
