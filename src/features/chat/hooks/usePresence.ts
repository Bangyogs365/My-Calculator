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


const updateOnline =
async()=>{


await supabase

.from(
"user_presence"
)

.upsert({

user_id:userId,

is_online:true,

last_seen:
new Date()
.toISOString()

});


};



updateOnline();



const interval =
setInterval(
updateOnline,
30000
);



return ()=>{

clearInterval(interval);


supabase
.from(
"user_presence"
)
.update({

is_online:false,

last_seen:
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