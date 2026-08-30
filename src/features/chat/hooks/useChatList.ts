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
  getUserConversations
} from "../services/conversationService";


export interface ChatListItem {

  id:string;

  title:string | null;

  type:string;

  partner: {

    id:string;

    display_name:string;

    avatar_url:string|null;

  } | null;


  last_message:

  {

    content:string;

    status:string;

    created_at:string;

  } | null;


  unread:number;

}



export function useChatList(
  userId?:string
){


const [data,setData] =
useState<ChatListItem[]>([]);


const [loading,setLoading] =
useState(true);


const [error,setError] =
useState<string|null>(null);




const load = useCallback(async()=>{


if(!userId)
return;



try{


setLoading(true);



const result =
await getUserConversations(
  userId
);



setData(
  result as ChatListItem[]
);



}

catch(err:any){


console.error(err);


setError(
 err.message ??
 "Failed load conversations"
);



}

finally{


setLoading(false);


}



},[userId]);






useEffect(()=>{


if(!userId)
return;



load();



const channel =

supabase

.channel(
`chat-list-${userId}`
)



.on(

"postgres_changes",

{

event:"INSERT",

schema:"public",

table:"chat_messages"

},

()=>{

load();

}

)



.on(

"postgres_changes",

{

event:"UPDATE",

schema:"public",

table:"chat_messages"

},

()=>{

load();

}

)



.subscribe();





return ()=>{


supabase.removeChannel(
channel
);


};



},[
userId,
load
]);






return {


data,

loading,

error,

refresh:load


};


}
