"use client";


import {
 useState,
 useCallback
} from "react";


import {
 useCalculatorEngine
} from "./useCalculatorEngine";


import {
 usePinGateDetector
} from "./usePinGateDetector";


import ProfileSetupModal
from "@/features/profile/ProfileSetupModal";


import {
 createSession
} from "@/features/auth-gate/entrySession";



export default function CalculatorScreen(){


const {

 display,

 inputHistory,

 inputNumber,

 chooseOperator,

 calculate,

 clear

}=useCalculatorEngine();



const [
 showProfileSetup,
 setShowProfileSetup
]=useState(false);



const [
 triggerCode,
 setTriggerCode
]=useState("");





/*
 Trigger +=

 membaca 3 angka terakhir
*/

const handleGateTrigger =
useCallback(
(code:string)=>{


 setTriggerCode(code);


 /*
  sementara validasi lokal

  nanti diganti:
  Supabase verification
 */


 if(code.length===3){

   setShowProfileSetup(true);

 }


},
[]);



usePinGateDetector(
 inputHistory,
 handleGateTrigger
);





function saveProfile(data:any){


 /*
 nanti:
 insert user_profiles
 upload avatar
 bind device
 */


 const fakeProfileId =
 crypto.randomUUID();



 createSession(
  fakeProfileId
 );


 setShowProfileSetup(false);


}





function press(value:string){


 if(
  value==="="
 ){

   calculate();

   return;

 }


 if(
  ["+","-","*","/"]
  .includes(value)
 ){

   chooseOperator(
    value as any
   );

   return;

 }


 inputNumber(value);


}






return (

<div
className="
min-h-screen
bg-[#0A090C]
text-white
flex
items-center
justify-center
p-5
"
>


<div
className="
w-full
max-w-md
bg-[#131217]
rounded-[32px]
shadow-2xl
border
border-[#C9A15E]/20
overflow-hidden
"
>


{/* HEADER */}

<div
className="
px-6
pt-8
pb-5
"
>


<div
className="
text-[#C9A15E]
text-sm
tracking-[0.3em]
uppercase
"
>

MY CALCULATOR

</div>



<div
className="
text-[#F3EFE6]
text-xl
font-semibold
mt-2
"
>

Secure Entry

</div>


</div>





{/* DISPLAY */}


<div
className="
mx-5
rounded-3xl
bg-[#1B191F]
p-6
min-h-[150px]
flex
flex-col
justify-end
items-end
border
border-white/5
"
>


<div
className="
text-xs
text-[#A79E90]
mb-3
"
>

{triggerCode && 
`CODE ${triggerCode}`
}

</div>



<div
className="
text-5xl
font-semibold
break-all
text-[#F3EFE6]
"
>

{display}

</div>


</div>







{/* BUTTON AREA */}


<div
className="
grid
grid-cols-4
gap-3
p-5
"
>


<Button
label="AC"
type="action"
onClick={clear}
/>



<Button
label="÷"
type="operator"
onClick={()=>press("/")}
/>



<Button
label="×"
type="operator"
onClick={()=>press("*")}
/>



<Button
label="⌫"
type="action"
onClick={clear}
/>





<Button
label="7"
onClick={()=>press("7")}
/>


<Button
label="8"
onClick={()=>press("8")}
/>


<Button
label="9"
onClick={()=>press("9")}
/>


<Button
label="-"
type="operator"
onClick={()=>press("-")}
/>





<Button
label="4"
onClick={()=>press("4")}
/>


<Button
label="5"
onClick={()=>press("5")}
/>


<Button
label="6"
onClick={()=>press("6")}
/>


<Button
label="+"
type="operator"
onClick={()=>press("+")}
/>





<Button
label="1"
onClick={()=>press("1")}
/>


<Button
label="2"
onClick={()=>press("2")}
/>


<Button
label="3"
onClick={()=>press("3")}
/>


<Button
label="="
type="equal"
onClick={()=>press("=")}
/>





<Button
label="0"
wide
onClick={()=>press("0")}
/>



<Button
label="."
onClick={()=>press(".")}
/>



<Button
label="+="
type="gate"
onClick={()=>{

window.dispatchEvent(
new Event(
"calculator-trigger"
)
)

}}
/>



</div>



</div>




{
showProfileSetup &&

<ProfileSetupModal

onSave={saveProfile}

/>

}



</div>


);

}





function Button({

label,

onClick,

type="number",

wide=false

}:{

label:string;

onClick:()=>void;

type?:
"number"
|
"operator"
|
"action"
|
"equal"
|
"gate";

wide?:boolean;

}){


const styles={


number:
"bg-[#201E25] text-[#F3EFE6]",


operator:
"bg-[#C9A15E] text-black",


action:
"bg-[#2A2730] text-[#F3EFE6]",


equal:
"bg-[#25D366] text-black",


gate:
"bg-[#B3644F] text-white"

};


return (

<button

onClick={onClick}

className={`
${wide ? "col-span-2":""}

h-16

rounded-2xl

font-bold

text-xl

transition

active:scale-95

${styles[type]}

`}

>

{label}

</button>

);


}
