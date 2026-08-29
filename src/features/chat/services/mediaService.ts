import {
  supabase
} from "@/lib/supabase";



export type MediaType =
  | "image"
  | "video"
  | "audio"
  | "document";




export interface UploadResult {

  url: string;

  path: string;

  type: MediaType;

  size: number;

}






const BUCKET_NAME = "chat-media";







function detectMediaType(
  file: File
): MediaType {


  const mime = file.type;




  if (
    mime.startsWith("image/")
  ) {

    return "image";

  }




  if (
    mime.startsWith("video/")
  ) {

    return "video";

  }




  if (
    mime.startsWith("audio/")
  ) {

    return "audio";

  }




  return "document";

}









export function validateMediaSize(
  file: File
) {


  const MAX_SIZE =
    50 * 1024 * 1024;




  if (
    file.size > MAX_SIZE
  ) {

    throw new Error(
      "Ukuran file maksimal 50MB"
    );

  }




  return true;

}









/**
 * Upload file chat ke Supabase Storage
 */

export async function uploadChatMedia(

  file: File,

  userId: string,

  conversationId: string

): Promise<UploadResult> {



  validateMediaSize(file);




  const type =
    detectMediaType(file);




  const extension =
    file.name
      .split(".")
      .pop();




  const filename =
    `${crypto.randomUUID()}.${extension}`;





  const filePath =
    `${conversationId}/${userId}/${filename}`;







  const {
    error: uploadError

  } = await supabase

    .storage

    .from(BUCKET_NAME)

    .upload(

      filePath,

      file,

      {

        cacheControl: "3600",

        upsert: false

      }

    );






  if (
    uploadError
  ) {

    throw uploadError;

  }







  const {

    data

  } = supabase

    .storage

    .from(BUCKET_NAME)

    .getPublicUrl(

      filePath

    );







  return {


    url:
      data.publicUrl,


    path:
      filePath,


    type,


    size:
      file.size


  };


}









/**
 * Hapus media
 */

export async function deleteChatMedia(

  path: string

) {



  const {

    error

  } = await supabase

    .storage

    .from(BUCKET_NAME)

    .remove([

      path

    ]);






  if (
    error
  ) {

    throw error;

  }





  return true;


}









/**
 * Ambil URL public media
 */

export function getMediaUrl(

  path: string

) {


  const {

    data

  } = supabase

    .storage

    .from(BUCKET_NAME)

    .getPublicUrl(

      path

    );




  return data.publicUrl;

}