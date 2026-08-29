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



interface AuthContextType {

  userId:string | null;

  sessionId:string | null;

  accessVerified:boolean;

  loading:boolean;

  refreshSession:()=>Promise<void>;

  logout:()=>Promise<void>;

}



const AuthContext =
createContext<AuthContextType | undefined>(
  undefined
);





export function AuthProvider({

  children

}:{
  children:React.ReactNode;

}){


const [

  userId,

  setUserId

]=useState<string|null>(null);



const [

  sessionId,

  setSessionId

]=useState<string|null>(null);



const [

  accessVerified,

  setAccessVerified

]=useState(false);



const [

  loading,

  setLoading

]=useState(true);






/**
 * Membaca app_access_sessions
 */
async function refreshSession(){


try{


setLoading(true);



const {

data:auth

}

=
await supabase.auth.getSession();



/*
 Jika ada Supabase Auth
 */

if(auth.session?.user){


setUserId(
auth.session.user.id
);


}




/*
 Cari active access session
 */

const {

data,

error

}

=
await supabase

.from(
"app_access_sessions"
)

.select(
"id,user_id,is_active,expires_at"
)

.eq(
"is_active",
true
)

.order(
"created_at",
{
ascending:false
}
)

.limit(1)

.maybeSingle();




if(error){

console.error(
"Session check error:",
error
);

return;

}




if(data){


setSessionId(
data.id
);


setUserId(
data.user_id
);


setAccessVerified(
true
);


}

else{


setAccessVerified(false);


}



}

finally{


setLoading(false);


}


}






useEffect(()=>{


refreshSession();



},[]);







/**
 * Logout
 */
async function logout(){


try{


if(sessionId){


await supabase

.from(
"app_access_sessions"
)

.update({

is_active:false,

ended_at:
new Date()
.toISOString()

})

.eq(
"id",
sessionId
);


}



await supabase.auth.signOut();



setUserId(null);

setSessionId(null);

setAccessVerified(false);



}

catch(error){


console.error(
"Logout error",
error
);


}


}







return (

<AuthContext.Provider

value={{

userId,

sessionId,

accessVerified,

loading,

refreshSession,

logout

}}

>


{children}


</AuthContext.Provider>


);


}







export function useAuth(){


const context =
useContext(
AuthContext
);



if(!context){


throw new Error(
"useAuth must be used inside AuthProvider"
);


}



return context;


}