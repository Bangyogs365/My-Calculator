"use client";


import {
 useState
} from "react";



interface Props{

 onSave:(data:{
   name:string;
   pin:string;
   photo?:File|null;
 })=>void;

}



export default function ProfileSetupModal({
 onSave
}:Props){


const [name,setName]=useState("");

const [pin,setPin]=useState("");

const [photo,setPhoto]=useState<File|null>(null);



function submit(){


 if(!name || !pin)
 return;


 onSave({

   name,

   pin,

   photo

 });


}



return (

<div className="
fixed inset-0
bg-black/70
flex
items-center
justify-center
p-5
">


<div className="
bg-neutral-900
rounded-2xl
p-6
w-full
max-w-sm
">


<h2 className="
text-white
text-xl
font-bold
mb-5
">
Buat Profil
</h2>



<input
className="
w-full
bg-neutral-800
text-white
p-3
rounded-xl
mb-3
"
placeholder="Nama pengguna"
value={name}
onChange={
e=>setName(e.target.value)
}
/>



<input
className="
w-full
bg-neutral-800
text-white
p-3
rounded-xl
mb-3
"
placeholder="Kode akses pribadi"
type="password"
value={pin}
onChange={
e=>setPin(e.target.value)
}
/>



<input
type="file"
accept="image/*"
onChange={
e=>
setPhoto(
 e.target.files?.[0] ?? null
)
}
/>



<button
className="
mt-5
w-full
bg-yellow-600
text-black
font-bold
rounded-xl
p-3
"
onClick={submit}
>

SIMPAN

</button>



</div>


</div>

);

}
