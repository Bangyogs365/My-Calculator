"use client";

import { useState } from "react";

type Operator = "+" | "-" | "*" | "/";

export function useCalculatorEngine() {
  const [display, setDisplay] = useState("0");
  const [firstValue, setFirstValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);
  const [inputHistory, setInputHistory] = useState("");

  function inputNumber(value: string) {
    setDisplay((current) => {
      if (waitingNext) return value === "." ? "0." : value;
      if (value === "." && current.includes(".")) return current;
      if (current === "0") return value === "." ? "0." : value;
      return `${current}${value}`.slice(0, 15);
    });

    setWaitingNext(false);
    if (/^[0-9]$/.test(value)) {
      setInputHistory((previous) => `${previous}${value}`.slice(-50));
    }
  }

  function backspace() {
    if (waitingNext) {
      setDisplay("0");
      setWaitingNext(false);
      return;
    }

    setDisplay((current) => current.length > 1 ? current.slice(0, -1) : "0");
    setInputHistory((previous) => previous.slice(0, -1));
  }

  function chooseOperator(nextOperator: Operator) {
    setFirstValue(Number(display));
    setOperator(nextOperator);
    setWaitingNext(true);
  }

  function calculate() {
    if (firstValue === null || operator === null) return;

    const secondValue = Number(display);
    let result = 0;

    switch (operator) {
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
        result = secondValue === 0 ? 0 : firstValue / secondValue;
        break;
    }

    setDisplay(Number(result.toFixed(8)).toString());
    setFirstValue(null);
    setOperator(null);
    setWaitingNext(true);
  }

  function clear() {
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
    backspace,
    chooseOperator,
    calculate,
    clear,
  };
}
