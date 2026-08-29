"use client";


import {
  useEffect,
  useState,
  useCallback
} from "react";


import {
  supabase
} from "@/lib/supabase";





export interface TypingStatus {


user_id:string;


conversation_id:string;


is_typing:boolean;


updated_at:string;


}







export function useTypingStatus(

conversationId?:string,

userId?:string

){



const [

typingUsers,

setTypingUsers

]

=

useState<TypingStatus[]>([]);







/**
 * Update status typing user sendiri
 */

const setTyping = useCallback(

async(

isTyping:boolean

)=>{



if(

!conversationId

||

!userId

)

return;





const {

error

}

=

await supabase


.from(

"chat_typing_status"

)


.upsert({

conversation_id:

conversationId,


user_id:

userId,


is_typing:

isTyping,


updated_at:

new Date()

.toISOString()


});






if(error){

console.error(

"typing update error",

error

);

}



},

[

conversationId,

userId

]

);









useEffect(()=>{


if(

!conversationId

)

return;






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



const row =

payload.new as TypingStatus;






setTypingUsers(

prev=>{


const filtered =

prev.filter(

item=>

item.user_id !== row.user_id

);




if(

row.is_typing

){


return [

...filtered,

row

];


}



return filtered;


}

);



}

)






.subscribe();






return ()=>{


supabase

.removeChannel(

channel

);


};


},[conversationId]);








return {


typingUsers,


setTyping


};


}