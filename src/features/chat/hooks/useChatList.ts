"use client";

import {
 useEffect,
 useState
} from "react";

import {
 getChatList
} from "../services/chatService";

import type {
 Conversation
} from "@/types/chat";


export function useChatList(
 userId?:string
){

 const [data,setData]=useState<Conversation[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState<string|null>(null);


 useEffect(()=>{

   if(!userId){
     setLoading(false);
     return;
   }


   async function load(){

     try{

       setLoading(true);

       const result =
        await getChatList(userId);

       setData(result);

     }catch(err){

       setError(
        err instanceof Error
        ? err.message
        :"Failed loading chat"
       );

     }finally{

       setLoading(false);

     }

   }


   load();


 },[userId]);


 return {
   data,
   loading,
   error
 };

}