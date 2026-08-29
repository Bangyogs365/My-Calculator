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





interface Props {

  conversationId:string;

  currentUserId:string;

}





export default function ChatRoom({

  conversationId,

  currentUserId

}:Props){



  const {

    messages,

    loading

  } =
  useRealtimeMessages(
    conversationId
  );




  const {

    isTyping

  } =
  useTypingStatus(
    conversationId,
    currentUserId
  );



  usePresence(
    currentUserId
  );





  const [

    message,

    setMessage

  ] = useState("");



  const [

    sending,

    setSending

  ] = useState(false);



  const fileInput =
  useRef<HTMLInputElement>(null);



  const bottom =
  useRef<HTMLDivElement>(null);





  useEffect(()=>{


    bottom.current
    ?.scrollIntoView({
      behavior:"smooth"
    });


  },[
    messages
  ]);






  /*
   Auto read receipt
  */

  useEffect(()=>{


    async function updateRead(){


      const unread =

      messages.filter(

        item =>

        item.sender_id !== currentUserId

        &&

        item.status !== "read"

      );



      for(
        const item of unread
      ){

        await markRead(
          item.id
        );

      }


    }



    updateRead();



  },[
    messages,
    currentUserId
  ]);







  async function handleSend(){


    if(
      !message.trim()
    )
    return;



    try{


      setSending(true);



      await sendMessage({

        conversationId,

        senderId:
        currentUserId,

        content:
        message,

        messageType:
        "text"

      });



      setMessage("");



    }
    finally{


      setSending(false);


    }


  }







  async function handleFile(

    e:
    React.ChangeEvent<HTMLInputElement>

  ){


    const file =
    e.target.files?.[0];



    if(!file)
    return;




    const msg =

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

      msg.id

    );


  }








return (

<div
className="
sky-page
h-screen
flex
flex-col
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
text-green-400
text-sm
"
>

● Online

</div>



</header>








{/* MESSAGE LIST */}

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

Loading...

</div>

)

:

messages.map(

(item)=>(


<div

key={
item.id
}

className={`
flex

${
item.sender_id === currentUserId

?

"justify-end"

:

"justify-start"

}

`}

>


<div

className={`
sky-message

${
item.sender_id===currentUserId

?

"mine"

:

"other"

}

`}

>


<p>

{
item.content
}

</p>




{

item.sender_id===currentUserId

&&

(

<div
className="
text-xs
text-right
opacity-70
"
>

{

item.status==="sent"

&&
"✓"

}



{

item.status==="delivered"

&&
"✓✓"

}



{

item.status==="read"

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

isTyping &&

(

<div
className="
text-gray-500
text-sm
"
>

typing...

</div>

)

}



<div
ref={
bottom
}
/>



</section>









{/* COMPOSER */}

<footer
className="
p-3
border-t
border-white/10
flex
gap-2
"
>


<input

ref={
fileInput
}

type="file"

hidden

onChange={
handleFile
}

/>



<button

className="
sky-card
px-4
"

onClick={()=>fileInput.current?.click()}

>

+

</button>





<input

className="
sky-input
"

placeholder="
Message...
"

value={
message
}

onChange={

e=>

setMessage(
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

/>





<button

className="
sky-button
"

disabled={
sending
}

onClick={
handleSend
}

>

➤

</button>



</footer>





</div>

);


}