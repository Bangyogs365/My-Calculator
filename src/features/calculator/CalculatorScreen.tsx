"use client";

import { useState, useCallback } from "react";
import { Space_Grotesk } from "next/font/google";
import styles from "./CalculatorScreen.module.css";
import { useCalculatorEngine } from "./useCalculatorEngine";
import { usePinGateDetector } from "./usePinGateDetector";
import ProfileSetupModal from "@/features/profile/ProfileSetupModal";
import { createSession } from "@/features/auth-gate/entrySession";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
});

export default function CalculatorScreen() {
  const {
    display,
    inputHistory,
    inputNumber,
    chooseOperator,
    calculate,
    clear,
  } = useCalculatorEngine();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [triggerCode, setTriggerCode] = useState("");

  /*
   Trigger +=
   membaca 3 angka terakhir
  */
  const handleGateTrigger = useCallback((code: string) => {
    setTriggerCode(code);

    /*
     sementara validasi lokal
     nanti diganti: Supabase verification
    */
    if (code.length === 3) {
      setShowProfileSetup(true);
    }
  }, []);

  usePinGateDetector(inputHistory, handleGateTrigger);

  function saveProfile(data: any) {
    /*
    nanti:
    insert user_profiles
    upload avatar
    bind device
    */
    const fakeProfileId = crypto.randomUUID();

    createSession(fakeProfileId);

    setShowProfileSetup(false);
  }

  function press(value: string) {
    if (value === "=") {
      calculate();
      return;
    }

    if (["+", "-", "*", "/"].includes(value)) {
      chooseOperator(value as any);
      return;
    }

    inputNumber(value);
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.frame} ${spaceGrotesk.className}`}>
        <div className={styles.screenLabel}>
          <span className={styles.dot} />
          My Calculator
        </div>

        <div className={styles.screen}>
          <div className={styles.code}>{triggerCode && `CODE ${triggerCode}`}</div>
          <div className={styles.display}>{display}</div>
        </div>

        <div className={styles.grid}>
          <CalcButton className={styles.func} onClick={clear}>
            AC
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("/")}>
            ÷
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("*")}>
            ×
          </CalcButton>
          <CalcButton className={styles.func} onClick={clear}>
            ⌫
          </CalcButton>

          <CalcButton className={styles.num} onClick={() => press("7")}>
            7
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press("8")}>
            8
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press("9")}>
            9
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("-")}>
            −
          </CalcButton>

          <CalcButton className={styles.num} onClick={() => press("4")}>
            4
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press("5")}>
            5
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press("6")}>
            6
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("+")}>
            +
          </CalcButton>

          <CalcButton className={styles.num} onClick={() => press("1")}>
            1
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press("2")}>
            2
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press("3")}>
            3
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("=")}>
            =
          </CalcButton>

          <CalcButton className={`${styles.num} ${styles.zero}`} onClick={() => press("0")}>
            0
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press(".")}>
            .
          </CalcButton>
          <CalcButton
            className={styles.gate}
            onClick={() => {
              window.dispatchEvent(new Event("calculator-trigger"));
            }}
          >
            +=
          </CalcButton>
        </div>
      </div>

      {showProfileSetup && <ProfileSetupModal onSave={saveProfile} />}
    </div>
  );
}

function CalcButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button className={`${styles.btn} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
