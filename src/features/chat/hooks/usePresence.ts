"use client";


import {
  useEffect,
  useState,
  useCallback
} from "react";


import {
  supabase
} from "@/lib/supabase";





export interface UserPresence {


user_id:string;


status:
"online"
|
"offline"
|
"away";


last_active:string;


updated_at:string;


device_time?:string|null;


device_timezone?:string|null;


}









export function usePresence(

userId?:string

){



const [

onlineUsers,

setOnlineUsers

]

=

useState<UserPresence[]>([]);









/**
 * Update presence user sendiri
 */

const updatePresence = useCallback(

async(

status:
"online"
|
"offline"
|
"away"

)=>

{


if(!userId)

return;





const now =

new Date()

.toISOString();






const {

error

}

=

await supabase


.from(

"user_presence"

)


.upsert({

user_id:

userId,


status,


last_active:

now,


updated_at:

now,


device_time:

now,


device_timezone:

Intl.DateTimeFormat()

.resolvedOptions()

.timeZone


});







if(error){

console.error(

"presence error",

error

);

}


},[userId]);









/**
 * Listen realtime presence
 */

useEffect(()=>{


if(!userId)

return;






const channel =

supabase


.channel(

"user-presence"

)







.on(

"postgres_changes",

{


event:"*",

schema:"public",

table:"user_presence"

},



(payload)=>{


const row =

payload.new as UserPresence;





setOnlineUsers(

prev=>{


const exists =

prev.some(

item=>

item.user_id === row.user_id

);





if(exists){


return prev.map(

item=>

item.user_id === row.user_id

?

row

:

item

);


}





return [

...prev,

row

];


});


}


)







.subscribe();








// set online ketika mount

updatePresence(

"online"

);







/**
 * offline ketika keluar
 */

const handleUnload = ()=>{


updatePresence(

"offline"

);


};




window.addEventListener(

"beforeunload",

handleUnload

);







return ()=>{


window.removeEventListener(

"beforeunload",

handleUnload

);



supabase

.removeChannel(

channel

);



};


},[userId,updatePresence]);







return {


onlineUsers,


updatePresence


};


}