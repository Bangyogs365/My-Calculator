"use client";

import { useEffect } from "react";

export function usePinGateDetector(
  callback: (code: string) => void
) {
  useEffect(() => {

    function detect(event: Event) {

      const customEvent =
        event as CustomEvent<string>;

      const code = customEvent.detail;

      if (/^\d{3}$/.test(code)) {
        callback(code);
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

  }, [callback]);
}
