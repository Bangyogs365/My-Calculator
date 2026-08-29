"use client";


const SESSION_KEY =
"mycalc_session";


const DEVICE_KEY =
"mycalc_device_id";



export function getDeviceId(){


  let device =
    localStorage.getItem(
      DEVICE_KEY
    );


  if(!device){

    device =
      crypto.randomUUID();


    localStorage.setItem(
      DEVICE_KEY,
      device
    );

  }


  return device;

}



export function createSession(
 profileId:string
){


 const session={

   profileId,

   deviceId:getDeviceId(),

   createdAt:
   new Date().toISOString()

 };


 localStorage.setItem(
   SESSION_KEY,
   JSON.stringify(session)
 );


 return session;

}




export function getSession(){


 const data =
 localStorage.getItem(
   SESSION_KEY
 );


 if(!data)
 return null;


 return JSON.parse(data);


}



export function clearSession(){

 localStorage.removeItem(
  SESSION_KEY
 );

}
