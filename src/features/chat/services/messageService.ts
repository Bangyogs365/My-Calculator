import { supabase } from "@/lib/supabase";


export interface SendMessagePayload {

  conversationId: string;

  senderId: string;

  content: string;

}



export interface ChatMessage {

  id: string;

  conversation_id: string;

  sender_id: string;

  content: string;

  created_at: string;

  updated_at?: string;

}



/**
 * Mengirim pesan baru ke conversation
 */
export async function sendMessage(
  payload: SendMessagePayload
): Promise<ChatMessage> {


  const {
    conversationId,
    senderId,
    content,
  } = payload;



  if (!conversationId) {

    throw new Error(
      "Conversation ID is required"
    );

  }



  if (!senderId) {

    throw new Error(
      "Sender ID is required"
    );

  }



  if (!content.trim()) {

    throw new Error(
      "Message cannot be empty"
    );

  }



  const {
    data,
    error,
  } = await supabase

    .from("chat_messages")

    .insert({

      conversation_id:
        conversationId,

      sender_id:
        senderId,

      content:
        content.trim(),

    })

    .select()

    .single();



  if (error) {

    console.error(
      "Send message error:",
      error
    );


    throw new Error(
      error.message
    );

  }



  return data as ChatMessage;

}




/**
 * Mengambil histori pesan conversation
 */
export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {


  if (!conversationId) {

    throw new Error(
      "Conversation ID is required"
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
        ascending: true,
      }
    );



  if (error) {

    console.error(
      "Load messages error:",
      error
    );


    throw new Error(
      error.message
    );

  }



  return (
    data ?? []
  ) as ChatMessage[];

}




/**
 * Menghapus pesan
 */
export async function deleteMessage(
  messageId:string
):Promise<void>{


  if(!messageId){

    throw new Error(
      "Message ID is required"
    );

  }



  const {
    error,

  } = await supabase

    .from("chat_messages")

    .delete()

    .eq(
      "id",
      messageId
    );



  if(error){

    console.error(
      "Delete message error:",
      error
    );


    throw new Error(
      error.message
    );

  }


}