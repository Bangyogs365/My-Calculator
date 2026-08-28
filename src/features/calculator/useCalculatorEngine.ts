import { useState, useCallback } from "react";

type Operator = "+" | "-" | "×" | "÷" | null;

export function useCalculatorEngine() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? digit : display + digit);
      }
    },
    [display, waitingForOperand]
  );

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const compute = useCallback(
    (a: number, b: number, op: Operator): number => {
      switch (op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "×":
          return a * b;
        case "÷":
          return b === 0 ? NaN : a / b;
        default:
          return b;
      }
    },
    []
  );

  const inputOperator = useCallback(
    (nextOperator: Operator) => {
      const inputValue = parseFloat(display);

      if (previousValue === null) {
        setPreviousValue(inputValue);
      } else if (operator) {
        const result = compute(previousValue, inputValue, operator);
        setDisplay(String(result));
        setPreviousValue(result);
      }

      setWaitingForOperand(true);
      setOperator(nextOperator);
    },
    [display, previousValue, operator, compute]
  );

  const inputEquals = useCallback(() => {
    const inputValue = parseFloat(display);
    if (previousValue === null || operator === null) return;

    const result = compute(previousValue, inputValue, operator);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operator, compute]);

  return {
    display,
    inputDigit,
    inputDecimal,
    inputOperator,
    inputEquals,
    clear,
  };
}
