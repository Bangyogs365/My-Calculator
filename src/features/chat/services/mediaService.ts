"use client";


import {
  supabase
} from "@/lib/supabase";





export type MediaType =

"image"

|

"video"

|

"audio"

|

"document";






export interface UploadResult {


url:string;


path:string;


type:MediaType;


size:number;


}









const BUCKET = "chat-media";








function detectType(

file:File

):MediaType{


const mime = file.type;





if(

mime.startsWith("image/")

)

return "image";




if(

mime.startsWith("video/")

)

return "video";




if(

mime.startsWith("audio/")

)

return "audio";





return "document";


}









/**
 * Upload chat attachment
 */

export async function uploadChatMedia(

file:File,

userId:string,

conversationId:string

):Promise<UploadResult>{





const type = detectType(file);






const extension =

file.name

.split(".")

.pop();







const filename =

`${crypto.randomUUID()}.${extension}`;







const path =

`${conversationId}/${userId}/${filename}`;








const {

error

}

=

await supabase

.storage

.from(

BUCKET

)

.upload(

path,

file,

{


cacheControl:

"3600",


upsert:false


}

);







if(error){

throw error;

}







const {

data

}

=

supabase

.storage

.from(

BUCKET

)

.getPublicUrl(

path

);







return {


url:

data.publicUrl,


path,


type,


size:

file.size


};





}









/**
 * Delete media
 */


export async function deleteChatMedia(

path:string

){



const {

error

}

=

await supabase

.storage

.from(

BUCKET

)

.remove(

[

path

]

);






if(error){

throw error;

}




return true;


}









/**
 * Validate file size
 */


export function validateMediaSize(

file:File

){



const maxSize =

50 *

1024 *

1024;





if(

file.size > maxSize

){


throw new Error(

"File maksimal 50MB"

);


}



return true;


}"use client";


import {
  supabase
} from "@/lib/supabase";





export type MediaType =

"image"

|

"video"

|

"audio"

|

"document";






export interface UploadResult {


url:string;


path:string;


type:MediaType;


size:number;


}









const BUCKET = "chat-media";








function detectType(

file:File

):MediaType{


const mime = file.type;





if(

mime.startsWith("image/")

)

return "image";




if(

mime.startsWith("video/")

)

return "video";




if(

mime.startsWith("audio/")

)

return "audio";





return "document";


}









/**
 * Upload chat attachment
 */

export async function uploadChatMedia(

file:File,

userId:string,

conversationId:string

):Promise<UploadResult>{





const type = detectType(file);






const extension =

file.name

.split(".")

.pop();







const filename =

`${crypto.randomUUID()}.${extension}`;







const path =

`${conversationId}/${userId}/${filename}`;








const {

error

}

=

await supabase

.storage

.from(

BUCKET

)

.upload(

path,

file,

{


cacheControl:

"3600",


upsert:false


}

);







if(error){

throw error;

}







const {

data

}

=

supabase

.storage

.from(

BUCKET

)

.getPublicUrl(

path

);







return {


url:

data.publicUrl,


path,


type,


size:

file.size


};





}









/**
 * Delete media
 */


export async function deleteChatMedia(

path:string

){



const {

error

}

=

await supabase

.storage

.from(

BUCKET

)

.remove(

[

path

]

);






if(error){

throw error;

}




return true;


}









/**
 * Validate file size
 */


export function validateMediaSize(

file:File

){



const maxSize =

50 *

1024 *

1024;





if(

file.size > maxSize

){


throw new Error(

"File maksimal 50MB"

);


}



return true;


}