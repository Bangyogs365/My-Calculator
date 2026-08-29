"use client";


import {
  useEffect,
  useRef,
  useState
} from "react";


import {
  useRealtimeMessages
} from "./hooks/useRealtimeMessages";


import {
  useTypingStatus
} from "./hooks/useTypingStatus";


import {
  usePresence
} from "./hooks/usePresence";


import {
  sendMessage,
  markRead
} from "./services/messageService";


import {
  uploadChatMedia
} from "./services/mediaService";



interface ChatRoomProps {

  conversationId:string;

  currentUserId:string;

  partnerName?:string;

}




export default function ChatRoom({

  conversationId,

  currentUserId,

  partnerName="User"

}:ChatRoomProps){



  const {

    messages,

    loading

  }

  =
  useRealtimeMessages(
    conversationId
  );



  const {

    isTyping

  }

  =
  useTypingStatus(

    conversationId,

    currentUserId

  );



  usePresence(
    currentUserId
  );




  const [

    text,

    setText

  ] = useState("");



  const [

    sending,

    setSending

  ] = useState(false);



  const fileRef =
    useRef<HTMLInputElement>(null);



  const bottomRef =
    useRef<HTMLDivElement>(null);





  /*
   Auto scroll
  */

  useEffect(()=>{


    bottomRef
    .current
    ?.scrollIntoView({
      behavior:"smooth"
    });



  },[
    messages
  ]);






  /*
   Mark unread messages as read
  */

  useEffect(()=>{


    async function read(){


      const unread =
      messages.filter(

        message =>

        message.sender_id !== currentUserId

        &&

        message.status !== "read"

      );



      for(
        const message of unread
      ){

        await markRead(
          message.id
        );

      }


    }



    if(messages.length){

      read();

    }



  },[
    messages,
    currentUserId
  ]);







  async function handleSend(){


    if(
      !text.trim()
      ||
      sending
    )
    return;



    try{


      setSending(true);



      await sendMessage({

        conversationId,

        senderId:
        currentUserId,

        content:
        text,

        messageType:
        "text"

      });



      setText("");



    }

    finally{


      setSending(false);


    }



  }







  async function handleUpload(

    event:
    React.ChangeEvent<HTMLInputElement>

  ){


    const file =
    event.target.files?.[0];



    if(!file)
    return;



    /*
      Upload file dulu
    */


    const tempMessage =

    await sendMessage({

      conversationId,

      senderId:
      currentUserId,

      content:
      file.name,

      messageType:
      file.type.startsWith("image")

      ?

      "image"

      :

      "document"


    });




    await uploadChatMedia(

      file,

      tempMessage.id

    );


  }








return (

<main

className="
h-screen
bg-black
text-white
flex
flex-col
"

>



{/* HEADER */}

<header

className="
h-20
px-5
flex
items-center
justify-between
border-b
border-zinc-800
bg-black
"

>


<div>


<h1

className="
font-bold
text-lg
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



<div

className="
text-xs
text-gray-400
flex
gap-2
items-center
"

>


<span>

{partnerName}

</span>


<span
className="
text-green-400
"

>

● online

</span>



</div>


</div>




<div

className="
flex
gap-4
text-gray-400
"

>

⌕

⎋

</div>


</header>






{/* MESSAGE AREA */}

<section

className="
flex-1
overflow-y-auto
px-4
py-5
space-y-3
"

>


{

loading

?

(

<div
className="
text-gray-500
text-center
"
>

Loading messages...

</div>

)

:

messages.map(
message=>(


<div

key={
message.id
}

className={`
flex
${
message.sender_id===currentUserId

?

"justify-end"

:

"justify-start"

}
`}

>


<div

className={`
max-w-[75%]
rounded-2xl
px-4
py-3

${
message.sender_id===currentUserId

?

"bg-blue-600"

:

"bg-zinc-900"

}

`}

>


<p>

{
message.content
}

</p>



{


message.sender_id===currentUserId

&&

(

<div

className="
text-xs
text-right
opacity-70
mt-1
"

>


{

message.status==="sent"

&&

"✓"

}



{

message.status==="delivered"

&&

"✓✓"

}



{

message.status==="read"

&&

"✓✓"

}



</div>

)


}




</div>



</div>


)

)


}




{
isTyping

&&

(

<div

className="
text-sm
text-gray-500
"

>

typing...

</div>

)

}



<div
ref={
bottomRef
}
/>



</section>







{/* COMPOSER */}

<footer

className="
border-t
border-zinc-800
p-3
flex
gap-2
"

>



<input

ref={
fileRef
}

type="file"

hidden

onChange={
handleUpload
}

/>




<button

onClick={()=>fileRef.current?.click()}

className="
w-11
rounded-full
bg-zinc-900
"

>

+

</button>





<input

value={
text
}

onChange={

e=>

setText(
e.target.value
)

}


onKeyDown={

e=>{

if(
e.key==="Enter"
)

handleSend();

}

}


placeholder="
Message...
"


className="
flex-1
rounded-full
bg-zinc-900
px-5
outline-none
"

/>





<button

disabled={
sending
}

onClick={
handleSend
}

className="
px-5
rounded-full
bg-blue-600
"

>

➤

</button>



</footer>




</main>

);


}