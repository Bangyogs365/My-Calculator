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
        gap-2
        p-4
      "
    >

      {messages.length === 0 && (

        <div
          className="
            text-center
            text-sm
            text-gray-400
            py-10
          "
        >
          Belum ada pesan
        </div>

      )}



      {messages.map((message) => {


        const senderId =
          message.sender_id ??
          message.senderId ??
          message.user_id;



        const isMine =
          senderId === currentUserId;



        return (

          <MessageBubble

            key={message.id}

            text={
              message.content ?? ""
            }

            mine={
              isMine
            }

            read={
              message.status === "read" ||
              message.is_read === true
            }

          />

        );


      })}


    </div>
  );
}
