"use client";


import {
  supabase
} from "@/lib/supabase";





export interface ConversationItem {


  id:string;


  title:string | null;


  type:string;


  partner?:{


    id:string;

    display_name:string;

    avatar_url:string|null;


  }
  |
  null;



  last_message?:{


    content:string;

    status:string;

    created_at:string;


  }
  |
  null;



  unread:number;


}








/**
 * GET USER CONVERSATIONS
 */

export async function getUserConversations(

userId:string

){


const {

data,

error

}

=

await supabase

.from(
"conversations"
)


.select(`

id,

conversation_type,

title,

created_at,


conversation_members(

user_id,


user_profiles(

id,

display_name,

avatar_url

)

),


chat_messages(

id,

content,

status,

sender_id,

created_at

)

`)


.eq(

"conversation_members.user_id",

userId

)

.order(

"updated_at",

{

ascending:false

}

);





if(error){

throw error;

}







const result:

ConversationItem[]

=

(data ?? [])

.map(

(

conversation:any

)=>{


/*
 Cari lawan chat
*/

const partner =

conversation

.conversation_members

?.find(

(member:any)=>

member.user_id !== userId

)

?.user_profiles;





/*
 Ambil pesan terakhir
*/

const messages =

conversation.chat_messages

??

[];




const lastMessage =

messages.length

?

messages[

messages.length - 1

]

:

null;







return {


id:

conversation.id,



title:

conversation.title,



type:

conversation.conversation_type,



partner:

partner

?

{

id:
partner.id,

display_name:
partner.display_name,

avatar_url:
partner.avatar_url

}

:

null,




last_message:

lastMessage

?

{

content:
lastMessage.content,

status:
lastMessage.status,

created_at:
lastMessage.created_at

}

:

null,




unread:

messages.filter(

(msg:any)=>

msg.sender_id !== userId

&&

msg.status !== "read"

).length




};


}

);





return result;


}









/**
 * CREATE PRIVATE CONVERSATION
 */


export async function createConversation(

userId:string,

targetUserId:string

){



const {

data:conversation,

error

}

=

await supabase


.from(

"conversations"

)


.insert({

conversation_type:

"private",


is_private:

true,


created_by:

userId


})


.select()

.single();







if(error){

throw error;

}







const members = [

{

conversation_id:

conversation.id,

user_id:

userId

},


{

conversation_id:

conversation.id,

user_id:

targetUserId

}

];






const {

error:

memberError

}

=

await supabase


.from(

"conversation_members"

)


.insert(

members

);







if(memberError){

throw memberError;

}





return conversation;


}









/**
 * CHECK EXISTING PRIVATE CHAT
 */


export async function findPrivateConversation(

userId:string,

targetUserId:string

){


const {

data,

error

}

=

await supabase


.from(

"conversation_members"

)


.select(`

conversation_id,

conversations(

id,

conversation_type

)

`)


.in(

"user_id",

[

userId,

targetUserId

]

);





if(error){

throw error;

}





return data;


}