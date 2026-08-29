"use client";

import {
useEffect
} from "react";


import {
supabase
} from "@/lib/supabase";



export function usePresence(
userId:string
){


useEffect(()=>{


if(!userId)
return;



async function heartbeat(){


await supabase

.from(
"user_presence"
)

.upsert({

user_id:userId,

status:
"online",

last_active:
new Date()
.toISOString(),

last_heartbeat:
new Date()
.toISOString(),

device_time:
new Date()
.toISOString(),

device_timezone:
Intl.DateTimeFormat()
.resolvedOptions()
.timeZone

});


}



heartbeat();



const timer =
setInterval(
heartbeat,
30000
);



return ()=>{


clearInterval(timer);


supabase
.from(
"user_presence"
)
.update({

status:
"offline",

last_active:
new Date()
.toISOString()

})
.eq(
"user_id",
userId
);


};


},[
userId
]);


}