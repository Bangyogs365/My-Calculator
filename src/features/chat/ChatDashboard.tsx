"use client";


import {
  useEffect,
  useRef,
  useState
} from "react";


import {
  useParams
} from "next/navigation";


import {
  useAuth
} from "@/features/auth/AuthContext";


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








export default function ChatRoom(){


const params = useParams();


const conversationId =
params.id as string;




const {
userId
}
=
useAuth();





const {

messages,

loading

}
=
useRealtimeMessages(

conversationId

);






const {

typingUsers,

setTyping

}
=
useTypingStatus(

conversationId,

userId ?? undefined

);







const {

onlineUsers

}
=
usePresence(

userId ?? undefined

);







const [text,setText]
=
useState("");



const [uploading,setUploading]
=
useState(false);





const bottomRef =
useRef<HTMLDivElement>(null);









useEffect(()=>{


bottomRef.current?.scrollIntoView({

behavior:"smooth"

});


},[messages]);










async function handleSend(){


if(

!text.trim()

||

!userId

)

return;





await sendMessage({

conversationId,

senderId:userId,

content:text,

messageType:"text"

});




setText("");



setTyping(false);


}









async function handleFile(

e:React.ChangeEvent<HTMLInputElement>

){


const file =
e.target.files?.[0];



if(

!file

||

!userId

)

return;





try{


setUploading(true);



const media =

await uploadChatMedia(

file,

userId,

conversationId

);






await sendMessage({

conversationId,

senderId:userId,

content:file.name,

messageType:media.type,

mediaUrl:media.url

});




}

finally{


setUploading(false);


}



}









return (

<div

className="
min-h-screen
bg-black
text-white
flex
flex-col
"

>







<header

className="
p-4
border-b
border-white/10
flex
items-center
gap-3
"

>


<div

className="
w-10
h-10
rounded-full
bg-blue-500/20
flex
items-center
justify-center
"

>

S

</div>




<div>


<h2

className="
font-semibold
"

>

Sky Contact

</h2>



<div

className="
text-xs
text-gray-400
"

>


{

onlineUsers.some(

u=>

u.status==="online"

)

?

"Online"

:

"Offline"

}



</div>


</div>


</header>









<section

className="
flex-1
overflow-y-auto
p-4
space-y-3
"

>





{

messages.map(

(msg)=>(



<div

key={msg.id}

className={

`

flex

${

msg.sender_id===userId

?

"justify-end"

:

"justify-start"

}

`

}

>



<div

className={`

max-w-[75%]

rounded-2xl

px-4

py-3

${

msg.sender_id===userId

?

"bg-blue-600"

:

"bg-white/10"

}

`}

>




{

msg.message_type!=="text"

&&

(

<div

className="
text-xs
text-blue-300
mb-1
"

>

📎 {msg.message_type}

</div>

)

}





<div>

{msg.content}

</div>





{

msg.sender_id===userId

&&

(

<div

className="
text-right
text-xs
mt-1
opacity-70
"

>

{

msg.status==="read"

?

"✓✓"

:

msg.status==="delivered"

?

"✓✓"

:

"✓"

}

</div>

)

}




</div>



</div>


)

)

}






<div ref={bottomRef}/>


</section>








{

typingUsers.length>0

&&

<div

className="
px-5
text-xs
text-gray-400
"

>

sedang mengetik...

</div>

}










<footer

className="
p-3
border-t
border-white/10
flex
gap-2
"

>



<label

className="
cursor-pointer
"

>

📎

<input

type="file"

hidden

onChange={handleFile}

/>

</label>






<input

value={text}

onChange={(e)=>{


setText(e.target.value);


setTyping(

e.target.value.length>0

);


}}


placeholder="Message..."

className="
flex-1
bg-white/10
rounded-full
px-4
outline-none
"


/>






<button

onClick={handleSend}

className="
bg-blue-600
rounded-full
px-5
"

>

Send

</button>



</footer>






{

uploading

&&

<div

className="
absolute
top-20
right-5
text-xs
"

>

Uploading...

</div>

}



</div>


);


}