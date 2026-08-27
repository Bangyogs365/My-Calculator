# My Calculator — Family Chat

Aplikasi chat privat untuk keluarga, dengan antarmuka luar berupa kalkulator fungsional. Backend: Supabase (Postgres + Realtime + Storage). Dipakai secara internal, tidak dipublikasikan.

> ⚠️ Project ini bersifat privat/internal. Jangan commit kredensial (anon key, service role key) ke repo publik.

---

## Info Project

| | |
|---|---|
| **Project ref (Supabase)** | `ewdfgbuqnvfczaqqmzgh` |
| **Region** | `ap-southeast-1` |
| **Database** | PostgreSQL 17.6.1 |
| **Model data** | Berbasis akun (`user_profiles`/`conversations`/`chat_messages`) — model lama berbasis room-code sudah dihapus 27 Agu 2026 |

---

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`migration.md`](./migration.md) | Riwayat lengkap seluruh migrasi database, evolusi arsitektur, dan catatan keamanan |
| [`backendkontrak.md`](./backendkontrak.md) | Kontrak data untuk frontend: struktur tabel, RPC yang tersedia, storage bucket |
| [`frontend-struktur.md`](./frontend-struktur.md) | Struktur folder & peta layar untuk build frontend |

Baca urutan ini kalau baru pertama kali pegang project: `migration.md` (paham konteks) → `backendkontrak.md` (paham data) → `frontend-struktur.md` (mulai build UI).

---

## Cara Kerja Singkat

1. **Layar depan** (`/`) adalah kalkulator yang benar-benar berfungsi. Kombinasi tombol tertentu (PIN) membuka gerbang ke dashboard chat.
2. Setelah PIN benar, sesi tercatat di `app_entry_sessions`/`app_access_sessions`, lalu user masuk ke `/dashboard` (chat list, kontak, profil, galeri, settings).
3. Semua data chat realtime lewat Supabase Realtime (`chat_messages`, `user_presence`, `chat_typing_status`).
4. Notifikasi push selalu pakai teks generik dari `notification_templates` — isi pesan asli tidak pernah tampil di notifikasi OS.

---

## Environment

Frontend butuh minimal:

```env
VITE_SUPABASE_URL=https://ewdfgbuqnvfczaqqmzgh.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key, ambil dari dashboard Supabase>
```

Jangan pernah expose `service_role` key ke frontend — hanya untuk edge function/server.

---

## Menjalankan Migrasi

```bash
# Migrasi baru
supabase migration new nama_migrasi_snake_case

# Terapkan ke local
supabase db reset
```

Atau lewat MCP Supabase connector (`apply_migration`) — lihat detail di `migration.md`.

---

## Status & Yang Masih Terbuka

- ✅ Model data sudah dirapikan jadi satu skema (akun-based)
- ✅ RPC `get_chat_list_v2` sudah tersedia untuk chat list
- ⏳ Belum ada RPC pengganti untuk ambil pesan per percakapan & tandai dibaca (masih query manual — lihat `backendkontrak.md` §8)
- ⏳ RLS masih permisif (`USING (true)`) di banyak tabel — perlu diperketat berbasis `auth.uid()` sebelum dipakai lebih luas (lihat `migration.md` — Catatan Keamanan)
