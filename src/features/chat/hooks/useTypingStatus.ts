"use client";

import {
useEffect,
useState
} from "react";

import {
supabase
} from "@/lib/supabase";


export function useTypingStatus(
conversationId:string,
userId:string
){

const [typingUsers,setTypingUsers]
=
useState<string[]>([]);



useEffect(()=>{


const channel =
supabase
.channel(
`typing-${conversationId}`
)



.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"chat_typing_status",
filter:
`conversation_id=eq.${conversationId}`
},

(payload)=>{


const row:any =
payload.new;


if(
row.user_id !== userId
){

setTypingUsers([
row.user_id
]);

}


}

)


.subscribe();



return ()=>{

supabase.removeChannel(channel);

};


},[
conversationId,
userId
]);



return {
typingUsers,
isTyping:
typingUsers.length>0
};

}