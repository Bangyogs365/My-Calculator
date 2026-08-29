"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import styles from "./CalculatorScreen.module.css";
import { useCalculatorEngine } from "./useCalculatorEngine";
import { usePinGateDetector } from "./usePinGateDetector";
import ProfileSetupModal from "@/features/profile/ProfileSetupModal";
import { supabase } from "@/lib/supabase";
import { hashPin } from "@/lib/crypto/hashPin";
import { getProfileById } from "@/lib/profile";
import {
  clearSession,
  getDeviceId,
  getSession,
  recordSuccessfulEntry,
} from "@/features/auth-gate/entrySession";
import { logCalculatorAccess } from "@/features/auth-gate/accessLog";
import { verifyPin } from "@/features/auth-gate/verifyPin";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
});

export default function CalculatorScreen() {
  const router = useRouter();
  const {
    display,
    inputHistory,
    inputNumber,
    backspace,
    chooseOperator,
    calculate,
    clear,
  } = useCalculatorEngine();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [triggerCode, setTriggerCode] = useState("");
  const [gateError, setGateError] = useState("");
  const gateRequestInFlight = useRef(false);

  const handleGateTrigger = useCallback(async (code: string) => {
    if (gateRequestInFlight.current) return;

    setTriggerCode(code);
    setGateError("");

    const savedSession = getSession();
    if (!savedSession) {
      setShowProfileSetup(true);
      return;
    }

    gateRequestInFlight.current = true;
    try {
      const profile = await getProfileById(savedSession.profileId);

      if (!profile) {
        clearSession();
        setShowProfileSetup(true);
        return;
      }

      const valid = await verifyPin(code, profile.login_pin_hash);
      if (!valid) {
        await logCalculatorAccess(
          profile.id,
          "pin_fail",
          savedSession.deviceId,
        ).catch(() => undefined);
        setGateError("Kode akses salah. Silakan coba lagi.");
        return;
      }

      await recordSuccessfulEntry(profile.id);
      router.push("/dashboard");
    } catch (error) {
      setGateError(
        error instanceof Error
          ? error.message
          : "Validasi gagal. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      gateRequestInFlight.current = false;
    }
  }, [router]);

  usePinGateDetector(inputHistory, handleGateTrigger);

  async function saveProfile(data: {
    name: string;
    pin: string;
    photo?: File | null;
  }) {
    if (!data.name.trim()) throw new Error("Nama pengguna wajib diisi");
    if (!/^\d{3}$/.test(data.pin)) {
      throw new Error("Kode akses harus terdiri dari 3 angka");
    }

    let authUser = (await supabase.auth.getSession()).data.session?.user;
    if (!authUser) {
      const { data: anonymousData, error: anonymousError } =
        await supabase.auth.signInAnonymously();
      if (anonymousError || !anonymousData.user) {
        throw new Error(
          "Akun perangkat belum dapat dibuat. Pastikan autentikasi anonim aktif.",
        );
      }
      authUser = anonymousData.user;
    }

    const pinHash = await hashPin(data.pin);
    let avatarUrl: string | null = null;

    if (data.photo) {
      const extension =
        data.photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const avatarPath = `${authUser.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(avatarPath, data.photo, {
          contentType: data.photo.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload foto gagal: ${uploadError.message}`);
      avatarUrl = supabase.storage.from("avatars").getPublicUrl(avatarPath)
        .data.publicUrl;
    }

    const { data: existingProfile, error: lookupError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let profileId = existingProfile?.id as string | undefined;
    const profilePayload = {
      display_name: data.name.trim(),
      login_pin_hash: pinHash,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    };

    if (profileId) {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update(profilePayload)
        .eq("id", profileId);
      if (updateError) throw updateError;
    } else {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          auth_user_id: authUser.id,
          ...profilePayload,
        })
        .select("id")
        .single();
      if (insertError || !insertedProfile) {
        throw insertError ?? new Error("Profil gagal dibuat");
      }
      profileId = insertedProfile.id;
    }

    if (!profileId) throw new Error("ID profil tidak tersedia");
    await recordSuccessfulEntry(profileId);
    setShowProfileSetup(false);
    router.push("/dashboard");
  }

  function press(value: string) {
    if (value === "=") {
      calculate();
      return;
    }

    if (["+", "-", "*", "/"].includes(value)) {
      chooseOperator(value as "+" | "-" | "*" | "/");
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
          <div className={styles.code}>
            {triggerCode && `CODE ${triggerCode}`}
          </div>
          <div className={styles.display}>{display}</div>
        </div>

        {gateError && (
          <p role="alert" className="mt-2 text-center text-sm text-red-400">
            {gateError}
          </p>
        )}

        <div className={styles.grid}>
          <CalcButton
            className={styles.func}
            onClick={() => {
              clear();
              setTriggerCode("");
              setGateError("");
            }}
          >
            AC
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("/")}>
            ÷
          </CalcButton>
          <CalcButton className={styles.op} onClick={() => press("*")}>
            ×
          </CalcButton>
          <CalcButton className={styles.func} onClick={backspace}>
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

          <CalcButton
            className={`${styles.num} ${styles.zero}`}
            onClick={() => press("0")}
          >
            0
          </CalcButton>
          <CalcButton className={styles.num} onClick={() => press(".")}>
            .
          </CalcButton>
          <CalcButton
            className={styles.gate}
            onClick={() => window.dispatchEvent(new Event("calculator-trigger"))}
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
