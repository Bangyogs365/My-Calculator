"use client";

import { useState } from "react";

type Operator = "+" | "-" | "*" | "/";

export function useCalculatorEngine() {
  const [display, setDisplay] = useState("0");
  const [firstValue, setFirstValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);

  // menyimpan input angka terakhir untuk trigger gate
  const [inputHistory, setInputHistory] = useState("");

  function inputNumber(value: string) {
    setDisplay((current) => {
      if (waitingNext || current === "0") {
        return value;
      }

      return `${current}${value}`.slice(0, 15);
    });

    setWaitingNext(false);

    if (/^[0-9]$/.test(value)) {
      setInputHistory((prev) =>
        `${prev}${value}`.slice(-50)
      );
    }
  }


  function chooseOperator(op: Operator) {
    setFirstValue(Number(display));
    setOperator(op);
    setWaitingNext(true);
  }


  function calculate() {
    if (
      firstValue === null ||
      operator === null
    ) {
      return;
    }


    const secondValue = Number(display);

    let result = 0;


    switch(operator){

      case "+":
        result = firstValue + secondValue;
        break;


      case "-":
        result = firstValue - secondValue;
        break;


      case "*":
        result = firstValue * secondValue;
        break;


      case "/":
        result =
          secondValue === 0
          ? 0
          : firstValue / secondValue;

        break;
    }


    setDisplay(
      Number(
        result.toFixed(8)
      ).toString()
    );


    setFirstValue(null);
    setOperator(null);
    setWaitingNext(true);
  }



  function clear(){

    setDisplay("0");

    setFirstValue(null);

    setOperator(null);

    setWaitingNext(false);

    setInputHistory("");

  }



  return {

    display,

    inputHistory,

    inputNumber,

    chooseOperator,

    calculate,

    clear

  };

}
