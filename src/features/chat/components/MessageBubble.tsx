interface Props{

text:string;

mine:boolean;

read?:boolean;

}


export default function MessageBubble({
text,
mine,
read
}:Props){


return (

<div
className={`
flex
${mine?"justify-end":"justify-start"}
mb-3
`}
>


<div
className={`
max-w-[75%]
rounded-2xl
px-4
py-3

${
mine
?
"bg-blue-600 text-white"
:
"bg-zinc-900 text-gray-200"
}

`}
>


<p>
{text}
</p>


{
mine &&
(
<span
className="
text-xs
opacity-70
block
text-right
mt-1
"
>

{
read
?
"✓✓"
:
"✓"
}

</span>
)
}


</div>


</div>

)

}