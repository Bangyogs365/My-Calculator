"use client";

import { useState } from "react";
import styles from "./ProfileSetupModal.module.css";

interface Props {
  onSave: (data: { name: string; pin: string; photo?: File | null }) => Promise<void>;
}

export default function ProfileSetupModal({ onSave }: Props) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (saving) return;

    if (!name.trim()) {
      setError("Nama pengguna wajib diisi");
      return;
    }
    if (!/^\d{3}$/.test(pin)) {
      setError("Kode akses harus 3 angka");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave({ name: name.trim(), pin, photo });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>Buat Profil</h2>
        <p className={styles.subtitle}>Setup akses pertama kali untuk perangkat ini</p>

        <input
          className={styles.input}
          placeholder="Nama pengguna"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Kode akses (3 angka)"
          type="password"
          inputMode="numeric"
          maxLength={3}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 3))}
        />

        <div className={styles.fileRow}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} onClick={submit} disabled={saving}>
          {saving ? "Menyimpan..." : "SIMPAN"}
        </button>
      </div>
    </div>
  );
}