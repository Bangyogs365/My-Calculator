"use client";


import Link from "next/link";



export default function ChatDashboard(){


  return (

    <div
      className="
      min-h-screen
      bg-transparent
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





      {/* TAB MENU */}

      <nav
        className="
        px-5
        pt-5
        flex
        gap-8
        text-sm
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



      </nav>






      {/* CONTENT */}

      <section
        className="
        px-5
        py-6
        space-y-4
        "
      >


        <div
          className="
          sky-card
          p-5
          fade-in
          "
        >


          <h2
            className="
            font-bold
            text-lg
            "
          >

            Secure Communication

          </h2>



          <p
            className="
            text-sm
            text-gray-400
            mt-2
            "
          >

            Belum ada percakapan aktif.

          </p>


        </div>



        {/* Conversation container */}

        <div
          className="
          sky-card
          p-5
          "
        >


          <p
            className="
            text-gray-500
            text-sm
            text-center
            "
          >

            Conversation list akan terhubung ke Supabase.

          </p>


        </div>



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