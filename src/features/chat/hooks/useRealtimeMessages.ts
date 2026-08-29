"use client";


import {
useEffect,
useState
}
from "react";


import {
supabase
}
from "@/lib/supabase";



export interface Message {

id:string;

conversation_id:string;

sender_id:string;

content:string;

created_at:string;

}



export function useRealtimeMessages(
conversationId?:string
){


const [
messages,
setMessages
]=useState<Message[]>([]);



useEffect(()=>{


if(!conversationId)
return;



async function load(){


const {
data
}
=
await supabase
.from("chat_messages")
.select("*")
.eq(
"conversation_id",
conversationId
)
.order(
"created_at",
{
ascending:true
}
);


setMessages(
(data ?? []) as Message[]
);


}



load();



const channel =
supabase
.channel(
`chat-${conversationId}`
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


setMessages(
prev=>[
 ...prev,
 payload.new as Message
]
);


}


)



.subscribe();



return ()=>{


supabase
.removeChannel(channel);


}



},[
conversationId
]);



return messages;


}