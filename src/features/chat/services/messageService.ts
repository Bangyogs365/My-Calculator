import { supabase } from "@/lib/supabase";



export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "document";



export type MessageStatus =
  | "sent"
  | "delivered"
  | "read";



export interface ChatMessage {

  id: string;

  conversation_id: string;

  sender_id: string;

  content: string | null;

  message_type: MessageType;

  media_url?: string | null;

  media_thumbnail_url?: string | null;

  media_size?: number | null;

  media_duration?: number | null;

  status: MessageStatus;

  delivered_at?: string | null;

  read_at?: string | null;

  created_at: string;

  updated_at?: string | null;

}



export interface SendMessagePayload {

  conversationId: string;

  senderId: string;

  content?: string;

  messageType?: MessageType;

  mediaUrl?: string;

  mediaThumbnailUrl?: string;

  mediaSize?: number;

  mediaDuration?: number;

}




/**
 * Mengambil semua pesan dalam conversation
 */
export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {


  if (!conversationId) {

    throw new Error(
      "Conversation ID required"
    );

  }



  const {
    data,
    error,

  } = await supabase

    .from("chat_messages")

    .select("*")

    .eq(
      "conversation_id",
      conversationId
    )

    .order(
      "created_at",
      {
        ascending: true
      }
    );



  if(error){

    throw error;

  }



  return (
    data ?? []
  ) as ChatMessage[];

}






/**
 * Mengirim pesan baru
 */
export async function sendMessage(
payload: SendMessagePayload
): Promise<ChatMessage>{


const {

conversationId,

senderId,

content = "",

messageType = "text",

mediaUrl,

mediaThumbnailUrl,

mediaSize,

mediaDuration

} = payload;



if(!conversationId){

 throw new Error(
  "Conversation ID required"
 );

}



if(!senderId){

 throw new Error(
  "Sender ID required"
 );

}



if(
messageType==="text"
&&
!content.trim()
){

 throw new Error(
  "Message cannot be empty"
 );

}



const {
data,
error

}

=
await supabase

.from(
"chat_messages"
)

.insert({

conversation_id:
conversationId,

sender_id:
senderId,

content:
content.trim()
|| null,

message_type:
messageType,

media_url:
mediaUrl ?? null,

media_thumbnail_url:
mediaThumbnailUrl ?? null,

media_size:
mediaSize ?? null,

media_duration:
mediaDuration ?? null,

status:
"sent"

})

.select()

.single();




if(error){

 throw error;

}



return data as ChatMessage;


}






/**
 * Tandai pesan sudah diterima device
 */
export async function markDelivered(
messageId:string
){


if(!messageId){

 throw new Error(
  "Message ID required"
 );

}



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
"delivered",

delivered_at:
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






/**
 * Tandai pesan sudah dibaca
 */
export async function markRead(
messageId:string
){


if(!messageId){

 throw new Error(
  "Message ID required"
 );

}



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






/**
 * Hapus pesan
 */
export async function deleteMessage(
messageId:string
){


if(!messageId){

 throw new Error(
  "Message ID required"
 );

}



const {
error

}

=
await supabase

.from(
"chat_messages"
)

.delete()

.eq(
"id",
messageId
);



if(error){

 throw error;

}


}