"use client";


import {
 useChatList
} from "./hooks/useChatList";


export default function ChatDashboard(){

 // sementara mengambil dari auth/session existing
 // nanti disambungkan ke AuthContext repo

 const userId = undefined;


 const {
   data,
   loading,
   error
 } = useChatList(userId);



 if(loading){

   return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </main>
   );

 }



 if(error){

  return (
   <main className="min-h-screen bg-black text-red-400 p-6">
    {error}
   </main>
  );

 }



 return (

 <main
 className="
 min-h-screen
 bg-black
 text-white
 px-4
 py-6
 "
 >

   <header className="mb-6">

    <h1
    className="
    text-2xl
    font-bold
    text-blue-500
    "
    >
      Sky-Secure Chat
    </h1>

    <p className="text-gray-400 text-sm">
      Private encrypted family chat
    </p>

   </header>



   <section className="space-y-3">

   {
    data.length===0
    ?
    (
      <div className="text-gray-500">
        Belum ada percakapan
      </div>
    )
    :
    data.map(chat=>(

      <div
      key={chat.id}
      className="
      rounded-xl
      bg-zinc-900
      p-4
      border
      border-zinc-800
      "
      >

        <div className="font-semibold">
          {chat.title ?? "Conversation"}
        </div>


        <div
        className="
        text-sm
        text-gray-400
        mt-1
        "
        >

        {
          chat.last_message?.content
          ??
          "Belum ada pesan"
        }

        </div>


      </div>

    ))
   }

   </section>


 </main>

 );

}