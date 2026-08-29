import {
supabase
}
from "@/lib/supabase";



export async function markMessageRead(
messageId:string,
userId:string
){


const {
error
}
=
await supabase
.from(
"message_read_receipts"
)
.upsert({

message_id:
messageId,

user_id:
userId,

read_at:
new Date()
.toISOString()

});



if(error)
throw error;


}