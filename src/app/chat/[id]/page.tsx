"use client";


import {
  useParams
} from "next/navigation";


import {
  useAuth
} from "@/features/auth/AuthContext";


import ChatRoom
from "@/features/chat/ChatRoom";





export default function ChatPage(){


  const params =
  useParams();



  const conversationId =
  params.id as string;



  const {
    userId,
    loading

  } = useAuth();





  if(loading){


    return (

      <main
        className="
        sky-page
        flex
        items-center
        justify-center
        "
      >

        Loading secure session...

      </main>

    );


  }







  if(!userId){


    return (

      <main
        className="
        sky-page
        flex
        items-center
        justify-center
        text-gray-400
        "
      >

        Session tidak ditemukan.

      </main>

    );


  }






  return (

    <ChatRoom

      conversationId={
        conversationId
      }


      currentUserId={
        userId
      }


    />

  );


}