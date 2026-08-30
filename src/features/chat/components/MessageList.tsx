"use client";

import MessageBubble from "./MessageBubble";


interface MessageListProps {
  messages?: any[];
  currentUserId: string;
}


export default function MessageList({
  messages = [],
  currentUserId,
}: MessageListProps) {


  return (
    <div
      className="
        flex
        flex-col
        gap-1
        p-4
      "
    >

      {messages.map((message) => (

        <MessageBubble

          key={message.id}

          text={
            message.content ?? ""
          }

          mine={
            message.sender_id === currentUserId
          }

          read={
            message.status === "read"
          }

        />

      ))}


    </div>
  );
}
