"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCalculatorEngine } from "./useCalculatorEngine";
import { usePinGateDetector } from "./usePinGateDetector";
import { handleGateTrigger } from "@/features/auth-gate/verifyPin";

const DIGIT_BUTTONS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

export default function CalculatorScreen() {
  const router = useRouter();
  const engine = useCalculatorEngine();
  const [toast, setToast] = useState<string | null>(null);

  const onGateTriggered = useCallback(
    async (pin: string) => {
      const result = await handleGateTrigger(pin);
      if (result.status === "opened") {
        router.push("/dashboard");
      } else if (result.status === "pin_set") {
        setToast(result.message);
        setTimeout(() => setToast(null), 2000);
      }
      // wrong_pin & no_session: sengaja tidak menampilkan apapun di UI,
      // kalkulator terlihat tetap normal (tidak membocorkan ada gerbang).
    },
    [router]
  );

  const gate = usePinGateDetector(onGateTriggered);

  const pressDigit = (d: string) => {
    engine.inputDigit(d);
    gate.recordDigit(d);
  };

  const pressOperator = (op: "+" | "-" | "×" | "÷") => {
    engine.inputOperator(op);
    gate.recordOperator(op);
  };

  const pressEquals = () => {
    engine.inputEquals();
    gate.recordEquals();
  };

  const pressClear = () => {
    engine.clear();
    gate.reset();
  };

  return (
    <main style={styles.container}>
      <div style={styles.display}>{engine.display}</div>

      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.grid}>
        <Btn label="C" onClick={pressClear} variant="fn" />
        <Btn label="±" onClick={() => {}} variant="fn" />
        <Btn label="%" onClick={() => {}} variant="fn" />
        <Btn label="÷" onClick={() => pressOperator("÷")} variant="op" />

        {DIGIT_BUTTONS.slice(0, 3).map((d) => (
          <Btn key={d} label={d} onClick={() => pressDigit(d)} />
        ))}
        <Btn label="×" onClick={() => pressOperator("×")} variant="op" />

        {DIGIT_BUTTONS.slice(3, 6).map((d) => (
          <Btn key={d} label={d} onClick={() => pressDigit(d)} />
        ))}
        <Btn label="-" onClick={() => pressOperator("-")} variant="op" />

        {DIGIT_BUTTONS.slice(6, 9).map((d) => (
          <Btn key={d} label={d} onClick={() => pressDigit(d)} />
        ))}
        <Btn label="+" onClick={() => pressOperator("+")} variant="op" />

        <Btn label="0" onClick={() => pressDigit("0")} wide />
        <Btn label="." onClick={() => engine.inputDecimal()} />
        <Btn label="=" onClick={pressEquals} variant="op" />
      </div>
    </main>
  );
}

function Btn({
  label,
  onClick,
  variant,
  wide,
}: {
  label: string;
  onClick: () => void;
  variant?: "fn" | "op";
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.btn,
        ...(variant === "op" ? styles.btnOp : {}),
        ...(variant === "fn" ? styles.btnFn : {}),
        ...(wide ? { gridColumn: "span 2" } : {}),
      }}
    >
      {label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "16px",
    boxSizing: "border-box",
  },
  display: {
    color: "#fff",
    fontSize: "64px",
    fontWeight: 200,
    textAlign: "right",
    padding: "24px 8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  toast: {
    color: "#0f0",
    fontSize: "14px",
    textAlign: "right",
    marginBottom: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  btn: {
    aspectRatio: "1",
    borderRadius: "50%",
    border: "none",
    background: "#333",
    color: "#fff",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnOp: {
    background: "#ff9500",
    color: "#fff",
  },
  btnFn: {
    background: "#a5a5a5",
    color: "#000",
  },
};
