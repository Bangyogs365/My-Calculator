"use client";

import {
  useEffect,
  useState
} from "react";

import {
  supabase
} from "@/lib/supabase";


export function useTypingStatus(
  conversationId:string,
  userId:string
){

  const [
    typingUsers,
    setTypingUsers
  ] = useState<string[]>([]);



  useEffect(()=>{

    if(!conversationId || !userId)
      return;


    const channel =
      supabase
      .channel(
        `typing:${conversationId}`
      )

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"chat_typing_status",
          filter:
          `conversation_id=eq.${conversationId}`
        },

        (payload)=>{

          const row =
          payload.new as {
            user_id:string;
            is_typing:boolean;
          };


          if(
            row.user_id !== userId
          ){

            if(row.is_typing){

              setTypingUsers(
                prev=>[
                  ...new Set([
                    ...prev,
                    row.user_id
                  ])
                ]
              );

            }

            else{

              setTypingUsers(
                prev =>
                prev.filter(
                  id =>
                  id !== row.user_id
                )
              );

            }

          }

        }

      )

      .subscribe();



    return ()=>{

      supabase
      .removeChannel(channel);

    };


  },[
    conversationId,
    userId
  ]);



  return {

    typingUsers,

    isTyping:
    typingUsers.length > 0

  };

}