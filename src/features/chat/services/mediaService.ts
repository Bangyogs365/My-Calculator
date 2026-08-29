import {
supabase
}
from "@/lib/supabase";



export async function uploadChatMedia(
file:File,
userId:string
){


const filename =
`${userId}/${Date.now()}-${file.name}`;



const {
data,
error
}
=
await supabase
.storage
.from(
"chat-media"
)
.upload(
filename,
file
);



if(error)
throw error;



const {
data:url
}
=
supabase
.storage
.from(
"chat-media"
)
.getPublicUrl(
data.path
);



return {

path:data.path,

url:url.publicUrl,

type:file.type

};


}