import {
supabase
}
from "@/lib/supabase";



export async function markMessageRead(
messageId:string
){


const {
error

}
=
await supabase

.from(
"chat_messages"
)

.update({

status:
"read",

read_at:
new Date()
.toISOString()

})

.eq(
"id",
messageId
);



if(error){

throw error;

}


}