"use client";


import {
  useEffect,
  useState
} from "react";


import {
  supabase
} from "@/lib/supabase";



export interface ChatItem {

  id:string;

  title:string;

  avatar?:string|null;

  last_message?:{

    content:string;

    status:string;

    created_at:string;

  } | null;

}





export function useChatList(
userId?:string
){


const [

data,

setData

]=useState<ChatItem[]>([]);



const [

loading,

setLoading

]=useState(true);



const [

error,

setError

]=useState<string|null>(null);





useEffect(()=>{


if(!userId)
return;



async function load(){


try{


const {

data:rows,

error

}=

await supabase

.from(
"conversations"
)

.select(`

id,

title,

conversation_members(

user_id,

user_profiles(

full_name,

avatar_url

)

),

chat_messages(

content,

status,

created_at

)

`)

.order(
"created_at",
{
ascending:false
}
);




if(error)
throw error;



const mapped =

(rows ?? [])

.map(

(item:any)=>(


{

id:item.id,

title:

item.title

??

item.conversation_members

?.[0]

?.user_profiles

?.full_name

??

"Conversation",


avatar:

item.conversation_members

?.[0]

?.user_profiles

?.avatar_url

??

null,


last_message:

item.chat_messages

?.length

?

item.chat_messages

[
item.chat_messages.length-1
]

:

null


}


)

);



setData(mapped);



}

catch(err:any){

setError(
err.message
);

}

finally{

setLoading(false);

}


}



load();





const channel =

supabase

.channel(
"dashboard-chat-list"
)


.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"chat_messages"

},


()=>{

load();

}

)


.subscribe();




return ()=>{

supabase
.removeChannel(
channel
);

};


},[
userId
]);





return {

data,

loading,

error

};


}