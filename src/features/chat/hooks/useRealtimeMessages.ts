"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";


import {
  supabase
} from "@/lib/supabase";


import {
  getMessages
} from "../services/messageService";



export interface ChatMessage {

id:string;

conversation_id:string;

sender_id:string;

content:string;

message_type:string;

status:string;

created_at:string;

delivered_at?:string|null;

read_at?:string|null;

media_url?:string|null;

media_thumbnail_url?:string|null;

}




export function useRealtimeMessages(
conversationId?:string
){


const [messages,setMessages] =
useState<ChatMessage[]>([]);


const [loading,setLoading] =
useState(true);


const [error,setError] =
useState<string|null>(null);





const loadMessages = useCallback(async()=>{


if(!conversationId)
return;



try{


setLoading(true);



const data =
await getMessages(
conversationId
);



setMessages(
data as ChatMessage[]
);



}

catch(err:any){


console.error(err);


setError(
err.message ??
"Failed load messages"
);



}

finally{


setLoading(false);


}



},[
conversationId
]);







useEffect(()=>{


if(!conversationId)
return;



loadMessages();




const channel =

supabase

.channel(
`messages-${conversationId}`
)



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


setMessages(prev=>[

...prev,

payload.new as ChatMessage

]);


}

)





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


setMessages(prev=>

prev.map(message=>

message.id === payload.new.id

?

payload.new as ChatMessage

:

message

)

);


}

)






.on(

"postgres_changes",

{

event:"DELETE",

schema:"public",

table:"chat_messages",

filter:
`conversation_id=eq.${conversationId}`

},


(payload)=>{


setMessages(prev=>

prev.filter(message=>

message.id !== payload.old.id

)

);


}

)





.subscribe();





return ()=>{


supabase.removeChannel(
channel
);


};



},[
conversationId,
loadMessages
]);






return {


messages,

loading,

error,

refresh:loadMessages


};


}.ts
