"use client";


import Link from "next/link";


import {
  useAuth
} from "@/features/auth/AuthContext";


import {
  useChatList
} from "./hooks/useChatList";




export default function ChatDashboard(){



  const {

    userId

  } = useAuth();



  const {

    data: chats,

    loading,

    error

  } = useChatList(
    userId ?? undefined
  );






  return (

    <div
      className="
      sky-page
      min-h-screen
      pb-24
      "
    >




      {/* HEADER */}

      <header
        className="
        sky-header
        "
      >

        <div
          className="
          sky-brand
          "
        >

          <span
            className="
            primary
            "
          >
            Sky-Secure
          </span>

          {" "}

          <span
            className="
            secondary
            "
          >
            Chat
          </span>


        </div>



        <div
          className="
          flex
          gap-5
          text-gray-400
          "
        >

          <button>
            🔍
          </button>


          <button>
            ⎋
          </button>


        </div>


      </header>








      {/* TAB */}

      <div
        className="
        px-5
        pt-5
        flex
        gap-8
        border-b
        border-white/10
        "
      >


        <button
          className="
          text-blue-500
          pb-3
          border-b-2
          border-blue-500
          "
        >

          Kontak

        </button>



        <button
          className="
          text-gray-500
          pb-3
          "
        >

          Ruang Publik

        </button>




        <button
          className="
          text-gray-500
          pb-3
          "
        >

          Project Area

        </button>



      </div>







      {/* CONTENT */}

      <section
        className="
        px-5
        py-6
        space-y-4
        "
      >




      {

        loading

        &&

        (

          <div
            className="
            sky-card
            p-5
            text-center
            text-gray-400
            "
          >

            Loading secure chat...

          </div>

        )

      }






      {

        error

        &&

        (

          <div
            className="
            sky-card
            p-5
            text-red-400
            "
          >

            {error}

          </div>

        )

      }








      {

        !loading
        &&
        chats.length === 0

        &&

        (

          <div
            className="
            sky-card
            p-6
            text-center
            "
          >

            <h2
              className="
              font-bold
              "
            >

              Secure Communication

            </h2>


            <p
              className="
              text-sm
              text-gray-500
              mt-2
              "
            >

              Belum ada percakapan.

            </p>


          </div>

        )

      }








      {

        chats.map(

          chat => (

            <Link

              key={
                chat.id
              }

              href={
                `/chat/${chat.id}`
              }


              className="
              sky-card
              p-4
              flex
              items-center
              gap-4
              block
              transition
              hover:scale-[1.01]
              "

            >





              {/* AVATAR */}

              <div
                className="
                w-12
                h-12
                rounded-full
                bg-blue-600/20
                flex
                items-center
                justify-center
                text-blue-400
                font-bold
                "
              >

                {

                  chat.title
                  ?.charAt(0)
                  ?.toUpperCase()

                  ??

                  "S"

                }


              </div>







              {/* INFO */}

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
                  "
                >

                  <h3
                    className="
                    font-semibold
                    truncate
                    "
                  >

                    {
                      chat.title
                    }

                  </h3>



                  {

                  chat.last_message

                  &&

                  (

                  <span
                    className="
                    text-xs
                    text-gray-500
                    "
                  >

                    {
                      new Date(
                        chat.last_message.created_at
                      )
                      .toLocaleTimeString(
                        [],
                        {
                          hour:"2-digit",
                          minute:"2-digit"
                        }
                      )
                    }

                  </span>

                  )

                  }


                </div>





                <div
                  className="
                  flex
                  justify-between
                  mt-1
                  "
                >


                  <p
                    className="
                    text-sm
                    text-gray-400
                    truncate
                    "
                  >

                    {

                    chat.last_message

                    ?

                    chat.last_message.content

                    :

                    "Belum ada pesan"

                    }


                  </p>





                  {

                  chat.last_message

                  &&

                  (

                    <span
                      className="
                      text-xs
                      text-blue-400
                      "
                    >

                    {

                    chat.last_message.status==="read"

                    ?

                    "✓✓"

                    :

                    chat.last_message.status==="delivered"

                    ?

                    "✓✓"

                    :

                    "✓"

                    }

                    </span>

                  )

                  }


                </div>


              </div>





            </Link>

          )

        )

      }





      </section>









      {/* BOTTOM NAV */}

      <nav
        className="
        sky-bottom-nav
        "
      >


        <button
          className="
          active
          "
        >

          Chat

        </button>



        <button
          className="
          text-gray-500
          "
        >

          Contact

        </button>



        <button
          className="
          text-gray-500
          "
        >

          Profile

        </button>


      </nav>





    </div>

  );

}