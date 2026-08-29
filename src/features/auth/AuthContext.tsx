"use client";

import {
 createContext,
 useContext,
 useEffect,
 useState
} from "react";

import {
 supabase
} from "@/lib/supabase";


interface AuthState {

 userId:string | null;

 loading:boolean;

 accessVerified:boolean;

}


const AuthContext =
createContext<AuthState>({
 userId:null,
 loading:true,
 accessVerified:false
});



export function AuthProvider({
 children
}:{
 children:React.ReactNode
}){


const [state,setState]=
useState<AuthState>({
 userId:null,
 loading:true,
 accessVerified:false
});



useEffect(()=>{


async function init(){


 const {
  data:{
   session
  }
 } =
 await supabase.auth.getSession();



 if(!session){

  setState({
   userId:null,
   loading:false,
   accessVerified:false
  });

  return;

 }



 const userId =
 session.user.id;



 const {
  data:access
 } =
 await supabase
 .from("app_access_sessions")
 .select("*")
 .eq(
   "user_id",
   userId
 )
 .eq(
   "is_active",
   true
 )
 .maybeSingle();



 setState({

  userId,

  loading:false,

  accessVerified:
   !!access

 });



}



init();


},[]);



return (

<AuthContext.Provider value={state}>

 {children}

</AuthContext.Provider>

);


}



export function useAuth(){

 return useContext(AuthContext);

}