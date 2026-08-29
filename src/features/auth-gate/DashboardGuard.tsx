"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Membungkus semua halaman /dashboard/*. Kalau gerbang kalkulator belum
 * dibuka di sesi browser ini (mis. akses langsung lewat URL /dashboard
 * tanpa lewat kalkulator dulu), tendang balik ke "/".
 *
 * sessionStorage (bukan localStorage) sengaja dipakai supaya gerbang
 * otomatis tertutup lagi begitu tab/app ditutup.
 */
export default function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isOpen = sessionStorage.getItem("mycalc_gate_open") === "1";
    if (!isOpen) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
