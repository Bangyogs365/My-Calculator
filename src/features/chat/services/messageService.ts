"use client";


import { supabase } from "@/lib/supabase";



export interface SendMessagePayload {


  conversationId:string;


  senderId:string;


  content:string;


  messageType?:
  "text"
  |
  "image"
  |
  "video"
  |
  "audio"
  |
  "document";


  mediaUrl?:string | null;


}






/**
 * GET MESSAGE LIST
 */

export async function getMessages(

  conversationId:string

){


  const {

    data,

    error

  } = await supabase


    .from(
      "chat_messages"
    )


    .select(`

      id,

      conversation_id,

      sender_id,

      content,

      message_type,

      status,

      created_at,

      delivered_at,

      read_at,

      media_url,

      media_thumbnail_url,

      media_size,

      media_duration

    `)


    .eq(

      "conversation_id",

      conversationId

    )


    .order(

      "created_at",

      {

        ascending:true

      }

    );





  if(error){

    throw error;

  }




  return data ?? [];


}








/**
 * SEND MESSAGE
 */

export async function sendMessage(

payload:SendMessagePayload

){


  const {

    data,

    error

  } = await supabase


    .from(
      "chat_messages"
    )


    .insert({

      conversation_id:
      payload.conversationId,


      sender_id:
      payload.senderId,


      content:
      payload.content,


      message_type:
      payload.messageType
      ??
      "text",


      media_url:
      payload.mediaUrl
      ??
      null,


      status:
      "sent"


    })


    .select()


    .single();






  if(error){

    throw error;

  }





  return data;


}







/**
 * MARK MESSAGE READ
 */

export async function markRead(

messageId:string

){


  const {

    error

  } = await supabase


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



  return true;


}







/**
 * MARK DELIVERED
 */

export async function markDelivered(

messageId:string

){


  const {

    error

  } = await supabase


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



  return true;


}







/**
 * DELETE MESSAGE
 */

export async function deleteMessage(

messageId:string

){


  const {

    error

  } = await supabase


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


  return true;


}