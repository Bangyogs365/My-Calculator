"use client";

import { useEffect } from "react";


export function usePinGateDetector(
  inputHistory:string,
  callback:(code:string)=>void
){

  useEffect(()=>{


    function detect(){

      const lastThree =
        inputHistory.slice(-3);


      if(
        lastThree.length === 3
      ){

        callback(lastThree);

      }

    }



    window.addEventListener(
      "calculator-trigger",
      detect
    );


    return()=>{

      window.removeEventListener(
        "calculator-trigger",
        detect
      );

    };


  },[
    inputHistory,
    callback
  ]);



}
