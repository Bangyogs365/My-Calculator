"use client";


import {
  useEffect,
  useState
} from "react";


import {
  supabase
} from "@/lib/supabase";





export interface ChatListItem {


  conversation_id:string;


  partner_id:string | null;


  last_message:string;


  last_status:string;


  last_time:string;


  unread:number;


}






export function useChatList(
  userId?:string
){


  const [

    chats,

    setChats

  ] = useState<ChatListItem[]>([]);



  const [

    loading,

    setLoading

  ] = useState(true);



  const [

    error,

    setError

  ] = useState<string|null>(null);








  async function loadChats(){



    if(!userId)
    return;




    try{


      setLoading(true);



      const {

        data,

        error

      }

      =

      await supabase

      .from(
        "chat_messages"
      )

      .select(
`
id,
conversation_id,
sender_id,
receiver_id,
content,
status,
created_at
`
      )

      .or(
`
sender_id.eq.${userId},
receiver_id.eq.${userId}
`
      )

      .order(
        "created_at",
        {
          ascending:false
        }
      );





      if(error)
      throw error;






      const grouped =
      new Map<string,ChatListItem>();





      data?.forEach(
      (
        message:any
      )=>{



        const id =
        message.conversation_id;



        if(!id)
        return;





        const partner =

        message.sender_id === userId

        ?

        message.receiver_id

        :

        message.sender_id;





        if(
          !grouped.has(id)
        ){


          grouped.set(

            id,

            {

              conversation_id:id,

              partner_id:partner,

              last_message:
              message.content,

              last_status:
              message.status,

              last_time:
              message.created_at,

              unread:

              message.sender_id !== userId

              &&

              message.status !== "read"

              ?

              1

              :

              0


            }

          );


        }




      });





      setChats(

        Array.from(
          grouped.values()
        )

      );




    }

    catch(err:any){


      console.error(
        err
      );


      setError(
        err.message
        ??
        "Failed load chats"
      );


    }

    finally{


      setLoading(false);


    }



  }









  useEffect(()=>{


    if(!userId)
    return;



    loadChats();






    const channel =

    supabase

    .channel(
      `chat-list-${userId}`
    )



    .on(

      "postgres_changes",

      {

        event:"*",

        schema:"public",

        table:"chat_messages"

      },


      ()=>{

        loadChats();

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
    userId
  ]);







  return {


    data:chats,


    loading,


    error,


    refresh:loadChats


  };


}