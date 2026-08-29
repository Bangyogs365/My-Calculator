"use client";


import Link from "next/link";

import {
  useAuth
} from "@/features/auth/AuthContext";


import {
  useChatList
} from "./hooks/useChatList";



export default function ChatDashboard() {


  const {
    userId,
    loading: authLoading,
    accessVerified,

  } = useAuth();



  const {
    data: chats,
    loading,
    error,

  } = useChatList(
    userId ?? undefined
  );



  /*
   * Auth masih memeriksa session
   */
  if(authLoading){

    return (

      <main
        className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        "
      >

        Checking secure access...

      </main>

    );

  }



  /*
   * User belum melewati kalkulator PIN
   */
  if(!accessVerified){

    return (

      <main
        className="
        min-h-screen
        bg-black
        text-white
        flex
        flex-col
        items-center
        justify-center
        gap-3
        "
      >

        <h1
          className="
          text-xl
          font-bold
          text-blue-500
          "
        >

          Sky-Secure Chat

        </h1>


        <p
          className="
          text-gray-400
          text-sm
          text-center
          px-6
          "
        >

          Akses chat terkunci.
          Silakan buka melalui kalkulator.

        </p>


      </main>

    );

  }




  /*
   * Loading conversation
   */
  if(loading){

    return (

      <main
        className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        "
      >

        Loading chats...

      </main>

    );

  }



  /*
   * Error Supabase
   */
  if(error){

    return (

      <main
        className="
        min-h-screen
        bg-black
        text-red-400
        p-6
        "
      >

        Failed:
        {" "}
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
      py-5
      "
    >


      {/* HEADER */}

      <header
        className="
        flex
        items-center
        justify-between
        mb-6
        "
      >

        <div>

          <h1
            className="
            text-2xl
            font-bold
            tracking-tight
            "
          >

            <span
              className="
              text-blue-500
              "
            >
              Sky-Secure
            </span>

            {" "}

            Chat

          </h1>


          <p
            className="
            text-xs
            text-gray-500
            mt-1
            "
          >

            Private Family Communication

          </p>

        </div>



        <button
          className="
          w-10
          h-10
          rounded-full
          bg-zinc-900
          border
          border-zinc-800
          "
        >

          ⚙

        </button>


      </header>




      {/* CHAT LIST */}

      <section
        className="
        space-y-3
        "
      >


      {
        chats.length === 0

        ?

        (

          <div
            className="
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            p-5
            text-gray-400
            text-center
            "
          >

            Belum ada percakapan

          </div>

        )


        :


        chats.map((chat)=>(


          <Link

            key={
              chat.id
            }

            href={
              `/chat/${chat.id}`
            }


            className="
            block
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            p-4
            active:scale-[0.98]
            transition
            "

          >


            <div
              className="
              flex
              justify-between
              "
            >

              <h2
                className="
                font-semibold
                "
              >

                {
                  chat.title
                  ??
                  "Conversation"
                }


              </h2>



              <span
                className="
                text-xs
                text-gray-500
                "
              >

                {chat.type}

              </span>


            </div>



            <p
              className="
              text-sm
              text-gray-400
              mt-2
              truncate
              "
            >

              {
                chat.last_message?.content
                ??
                "Belum ada pesan"
              }


            </p>



          </Link>


        ))

      }


      </section>




      {/* BOTTOM NAV */}

      <nav
        className="
        fixed
        bottom-0
        left-0
        right-0
        bg-black/90
        border-t
        border-zinc-800
        p-4
        flex
        justify-around
        "
      >

        <span
          className="
          text-blue-500
          text-sm
          "
        >

          Chat

        </span>


        <span
          className="
          text-gray-500
          text-sm
          "
        >

          Contact

        </span>


        <span
          className="
          text-gray-500
          text-sm
          "
        >

          Profile

        </span>


      </nav>



    </main>

  );

}