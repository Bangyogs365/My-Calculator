"use client";

import Image from "next/image";

import type { ChatListItem } from "../hooks/useChatList";


interface ChatListItemRowProps {
  chat: ChatListItem;
  onClick: () => void;
}


export default function ChatListItemRow({
  chat,
  onClick,
}: ChatListItemRowProps) {


  const name =
    chat.title ??
    chat.partner?.display_name ??
    "Tanpa nama";


  const avatar =
    chat.partner?.avatar_url ?? null;


  const preview =
    chat.last_message?.content ??
    "Belum ada pesan";


  return (
    <button
      onClick={onClick}
      className="
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        text-left
        hover:bg-white/5
        transition
      "
    >

      {/* Avatar */}
      <div
        className="
          relative
          w-12
          h-12
          rounded-full
          overflow-hidden
          bg-white/10
          flex
          items-center
          justify-center
          shrink-0
        "
      >

        {avatar ? (

          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover"
          />

        ) : (

          <span
            className="
              text-lg
              font-semibold
              text-white/70
            "
          >
            {name.charAt(0).toUpperCase()}
          </span>

        )}

      </div>


      {/* Content */}
      <div
        className="
          flex-1
          min-w-0
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            gap-2
          "
        >

          <h3
            className="
              font-medium
              text-white
              truncate
            "
          >
            {name}
          </h3>


          {chat.unread > 0 && (

            <span
              className="
                min-w-5
                h-5
                px-1.5
                rounded-full
                bg-blue-600
                text-white
                text-xs
                flex
                items-center
                justify-center
              "
            >
              {chat.unread}
            </span>

          )}

        </div>



        <p
          className="
            text-sm
            text-gray-400
            truncate
            mt-1
          "
        >
          {preview}
        </p>


      </div>

    </button>
  );
}
