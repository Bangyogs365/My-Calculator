"use client";


import {
  useEffect,
  useState,
  useCallback
} from "react";


import {
  supabase
} from "@/lib/supabase";


import {
  getMessages
} from "../services/messageService";


import type {
  ChatMessage
} from "../services/messageService";




export function useRealtimeMessages(
  conversationId?: string
){


  const [
    messages,
    setMessages
  ] = useState<ChatMessage[]>([]);



  const [
    loading,
    setLoading
  ] = useState(true);



  const [
    error,
    setError
  ] = useState<string | null>(null);





  /*
   * Load history awal
   */
  const loadMessages =
  useCallback(async()=>{


    if(!conversationId)
      return;



    try{


      setLoading(true);



      const data =
      await getMessages(
        conversationId
      );



      setMessages(data);



    }catch(err){


      setError(
        err instanceof Error
        ?
        err.message
        :
        "Failed loading messages"
      );


    }finally{


      setLoading(false);


    }



  },[
    conversationId
  ]);







  useEffect(()=>{


    if(!conversationId)
      return;



    loadMessages();




    /*
     * Realtime channel
     */

    const channel =
    supabase

    .channel(
      `conversation:${conversationId}`
    )



    /*
     * Pesan baru
     */

    .on(

      "postgres_changes",

      {

        event:"INSERT",

        schema:"public",

        table:"chat_messages",

        filter:
        `conversation_id=eq.${conversationId}`

      },


      (payload)=>{


        const newMessage =
        payload.new as ChatMessage;



        setMessages(
          previous=>[

            ...previous,

            newMessage

          ]
        );


      }

    )





    /*
     * Update status pesan
     *
     * sent
     * delivered
     * read
     */

    .on(

      "postgres_changes",

      {

        event:"UPDATE",

        schema:"public",

        table:"chat_messages",

        filter:
        `conversation_id=eq.${conversationId}`

      },


      (payload)=>{


        const updated =
        payload.new as ChatMessage;



        setMessages(
          previous =>

          previous.map(
            message =>

            message.id === updated.id

            ?

            updated

            :

            message

          )

        );


      }

    )



    .subscribe();






    return ()=>{


      supabase

      .removeChannel(
        channel
      );


    };



  },[
    conversationId,
    loadMessages
  ]);





  return {


    messages,

    loading,

    error,

    reload:
    loadMessages


  };


}