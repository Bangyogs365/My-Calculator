import { useRef, useCallback } from "react";

type KeyPress = { type: "digit" | "operator" | "equals"; value: string };

/**
 * Mengamati urutan tombol yang ditekan di kalkulator. Kalkulator tetap
 * berfungsi normal seperti biasa — deteksi ini berjalan paralel di
 * background, tidak mengubah perilaku hitung.
 *
 * Trigger gerbang: tepat 3 digit angka, diikuti tombol "+", diikuti "=".
 * Contoh: user menekan 1, 2, 3, +, = → onGateTriggered("123") dipanggil.
 * Kombinasi tombol ini valid secara matematis (123 + 0 = 123) jadi tidak
 * terlihat aneh di layar kalkulator.
 */
export function usePinGateDetector(onGateTriggered: (pin: string) => void) {
  const bufferRef = useRef<KeyPress[]>([]);

  const recordDigit = useCallback((digit: string) => {
    const buf = bufferRef.current;
    // reset buffer kalau digit ini bukan bagian dari 3-digit pertama yang bersih
    if (buf.length > 0 && buf[buf.length - 1].type !== "digit") {
      bufferRef.current = [];
    }
    bufferRef.current = [...bufferRef.current, { type: "digit" as const, value: digit }].slice(-3);
  }, []);

  const recordOperator = useCallback((op: string) => {
    bufferRef.current = [...bufferRef.current, { type: "operator", value: op }];
  }, []);

  const recordEquals = useCallback(() => {
    const buf = bufferRef.current;
    bufferRef.current = [...buf, { type: "equals", value: "=" }];

    const b = bufferRef.current;
    const last5 = b.slice(-5);
    const isPinPattern =
      last5.length === 5 &&
      last5[0].type === "digit" &&
      last5[1].type === "digit" &&
      last5[2].type === "digit" &&
      last5[3].type === "operator" &&
      last5[3].value === "+" &&
      last5[4].type === "equals";

    if (isPinPattern) {
      const pin = last5[0].value + last5[1].value + last5[2].value;
      bufferRef.current = [];
      onGateTriggered(pin);
    }
  }, [onGateTriggered]);

  const reset = useCallback(() => {
    bufferRef.current = [];
  }, []);

  return { recordDigit, recordOperator, recordEquals, reset };
}
