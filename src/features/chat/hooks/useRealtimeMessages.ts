"use client";


import {
  useEffect,
  useState
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




  useEffect(()=>{


    if(!conversationId){

      setMessages([]);

      setLoading(false);

      return;

    }



    let mounted = true;



    async function loadMessages(){


      try{


        setLoading(true);


        const result =
          await getMessages(
            conversationId
          );



        if(mounted){

          setMessages(result);

        }



      }
      catch(err){


        if(mounted){

          setError(
            err instanceof Error
            ? err.message
            : "Failed load messages"
          );

        }


      }
      finally{


        if(mounted){

          setLoading(false);

        }


      }


    }



    loadMessages();




    const channel =

      supabase

      .channel(
        `conversation:${conversationId}`
      )



      // Pesan baru masuk

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



          setMessages(prev=>{


            const exists =
              prev.some(
                item =>
                item.id === newMessage.id
              );



            if(exists){

              return prev;

            }



            return [

              ...prev,

              newMessage

            ];

          });



        }

      )



      // Update status read/delivered

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



          setMessages(prev=>


            prev.map(message=>


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


      mounted = false;



      supabase

      .removeChannel(
        channel
      );


    };



  },[
    conversationId
  ]);





  return {

    messages,

    loading,

    error

  };


}