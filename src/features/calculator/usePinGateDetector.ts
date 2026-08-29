"use client";

import { useEffect } from "react";

export function usePinGateDetector(
  inputHistory: string,
  triggerActive: boolean,
  callback: (code: string) => void
) {
  useEffect(() => {
    function detect() {
      if (!triggerActive) return;

      const lastThree = inputHistory.slice(-3);

      if (lastThree.length === 3) {
        callback(lastThree);
      }
    }

    window.addEventListener(
      "calculator-trigger",
      detect
    );

    return () => {
      window.removeEventListener(
        "calculator-trigger",
        detect
      );
    };

  }, [
    inputHistory,
    triggerActive,
    callback
  ]);
}