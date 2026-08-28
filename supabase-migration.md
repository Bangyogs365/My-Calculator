# Migration Log — My Calculator (Family Chat)

**Project ref:** `ewdfgbuqnvfczaqqmzgh`
**Database:** PostgreSQL 17.6.1 (Supabase, region `ap-southeast-1`)
**Total migrasi:** 38
**Rentang waktu:** 27–28 Agustus 2026 (relatif terhadap timestamp UTC)

Dokumen ini mencatat seluruh riwayat migrasi database untuk aplikasi chat keluarga privat (disamarkan dengan antarmuka kalkulator). Digunakan sebagai referensi teknis internal — bukan untuk dipublikasikan.

> **Update 27 Agu 2026, 18:xx** — Model chat lama berbasis `room_code` (Fase 1) sudah **dihapus permanen** dari database setelah dikonfirmasi seluruh tabelnya kosong (0 baris). Lihat migrasi #29 dan #30 di tabel bawah. Bagian "Fase 1" di ringkasan ini dipertahankan sebagai catatan historis saja — tabelnya sudah tidak ada lagi.

---

## Ringkasan Evolusi Arsitektur

Skema database berevolusi melalui tiga fase besar:

1. **Fase 1 — Prototipe "CalcChat" berbasis room code** (`015317`–`021219`)
   Chat sederhana berbasis kode ruangan (`room_code`), tanpa akun pengguna formal — device-id sebagai identitas.

2. **Fase 2 — Penambahan fitur media & privasi pesan** (`130040`–`141353`)
   Media terenkripsi, pesan sekali-lihat (view-once), galeri aplikasi terpisah dari galeri perangkat, kompresi media.

3. **Fase 3 — Migrasi ke arsitektur "Family Messenger" berbasis akun** (`132257` dst.)
   Beralih dari model room-code ke model akun pengguna (`user_profiles`), kontak, percakapan (`conversations`), dengan role admin, gerbang masuk lewat kalkulator, dan sistem notifikasi/presence real-time bergaya WhatsApp.

> Catatan: tabel-tabel Fase 1 (`messages`, `devices`, `room_members`, `profiles`) masih ada di database tapi sudah digantikan fungsinya oleh tabel Fase 3 (`chat_messages`, `user_profiles`, `conversations`). Pertimbangkan pembersihan/deprecation resmi jika tidak lagi dipakai frontend.

---

## Tabel Riwayat Migrasi

| # | Versi (timestamp) | Nama Migrasi | Ringkasan |
|---|---|---|---|
| 1 | 20260827015317 | `create_calcchat_messages` | Tabel `messages` awal berbasis `room_code`, RLS on, realtime aktif |
| 2 | 20260827015532 | `calcchat_premium_upgrade` | Status kirim/terkirim/dibaca, soft delete, tabel `devices` (presence) |
| 3 | 20260827015602 | `calcchat_add_client_id` | Kolom `client_id` untuk dedup pesan sisi klien |
| 4 | 20260827015818 | `calcchat_devices_replica_identity` | `REPLICA IDENTITY FULL` pada `devices` untuk realtime |
| 5 | 20260827020124 | `calcchat_profiles_and_storage` | Tabel `profiles` (nama, avatar, about) + bucket storage `avatars` (publik) |
| 6 | 20260827020235 | `calcchat_room_members_and_rpc` | Tabel `room_members`, trigger `touch_updated_at`, RPC `join_room`, `mark_room_read`, `get_chat_list` |
| 7 | 20260827020253 | `calcchat_fix_search_path` | Hardening: set `search_path` eksplisit pada semua fungsi (mitigasi search-path hijacking) |
| 8 | 20260827021219 | `calcchat_fix_devices_and_validation` | Refactor `devices` jadi presence global, constraint validasi panjang teks & format room code, RPC `leave_room` |
| 9 | 20260827130040 | `add_message_hidden_for_device` | Tabel `message_hidden_for` — sembunyikan pesan per perangkat tanpa menghapus untuk pihak lain |
| 10 | 20260827130053 | `add_get_room_messages_function` | RPC `get_room_messages` (memfilter pesan yang disembunyikan device tsb.) |
| 11 | 20260827130644 | `add_media_and_view_once_support` | Dukungan pesan media (image/video/audio), flag `is_view_once`, bucket privat `chat-media` (25 MB) |
| 12 | 20260827132257 | `convert_to_family_messenger_architecture` | **Perubahan arsitektur besar**: tabel baru `family_accounts`, `user_profiles`, `contacts`, `conversations`, `conversation_members`, `chat_messages` |
| 13 | 20260827132356 | `create_family_messenger_core_schema` | Definisi ulang/penguatan skema Family Messenger (constraint role, tipe percakapan) |
| 14 | 20260827132601 | `simplify_to_contact_based_messenger` | Index performa, kolom `updated_at`/`delivered_at`/`read_at` pada percakapan & pesan |
| 15 | 20260827132630 | `convert_contacts_as_family_relationship` | `contacts` jadi model relasi utama (nickname, blocked, favorite); tabel family lama ditandai deprecated via comment |
| 16 | 20260827132959 | `optimize_chat_performance_realtime` | Index tambahan, soft-delete pesan, `REPLICA IDENTITY FULL` pada `chat_messages` |
| 17 | 20260827133317 | `add_admin_role_and_contact_management_base` | Kolom `is_admin` di `user_profiles`, tabel `contact_invites` (kode undangan) |
| 18 | 20260827135242 | `add_admin_contact_crud_functions` | Tabel `admin_contacts` + fungsi CRUD terproteksi (`is_admin_user`, `admin_create/update/delete/list_contact`) |
| 19 | 20260827135409 | `enhance_chat_media_voice_support` | Kolom media tambahan (thumbnail, reply-to, forwarded), tabel referensi `chat_media` |
| 20 | 20260827135624 | `user_profile_pin_and_avatar_management` | Kolom `username`, `bio`, **`login_pin_hash`** untuk gerbang akses, tabel `profile_updates` |
| 21 | 20260827135727 | `add_realtime_user_presence_system` | Kolom `is_online`/`last_seen`, tabel `user_presence` (status online/offline/away/typing) |
| 22 | 20260827135813 | `device_time_presence_support` | Kolom `device_time`, `device_timezone`, `last_heartbeat` untuk presence lebih akurat |
| 23 | 20260827140030 | `realtime_notification_configuration` | Tabel `user_notification_settings`, `notification_templates` — termasuk template notifikasi tersamar ("perlu pembaruan aplikasi") |
| 24 | 20260827140205 | `complete_realtime_chat_notification_system` | Tabel `chat_typing_status`, `chat_unread_counts`, `push_notifications` |
| 25 | 20260827140534 | `calculator_entry_gate_auth_flow` | Tabel `app_entry_sessions`, `user_access_settings` — gerbang verifikasi masuk dari layar kalkulator |
| 26 | 20260827140614 | `calculator_gateway_chat_dashboard_access` | Tabel `app_access_sessions`, `calculator_access_logs` — sesi & log akses dari kalkulator ke dashboard chat |
| 27 | 20260827141353 | `media_compression_and_app_gallery_system` | Tabel `media_settings`, `app_gallery_media` (auto-expire 3 hari), `media_cleanup_queue` |
| 28 | 20260827153739 | `fix_frontend_runtime_rls_policies` | Perbaikan: mengaktifkan RLS + policy akses pada tabel yang sebelumnya gagal diakses frontend |
| 29 | 20260827181311 | `drop_legacy_roomcode_chat_model` | **Pembersihan**: drop tabel `messages`, `devices`, `room_members`, `profiles`, `message_hidden_for`, `family_accounts` (semua kosong) + RPC lama (`join_room`, `leave_room`, `mark_room_read`, `get_chat_list`, `get_room_messages`, `touch_updated_at`) |
| 30 | 20260827181500-an | `drop_orphaned_family_id_column` | Drop kolom yatim `user_profiles.family_id` (FK-nya hilang saat `family_accounts` didrop, kolomnya tertinggal) |
| 31 | 20260827183000-an | `add_get_chat_list_v2_account_based` | RPC baru `get_chat_list_v2(p_user_id)` — pengganti `get_chat_list` lama, untuk model akun. Sudah diuji, berfungsi. |
| 32 | 27 Agu, malam | `add_rls_policies_scoped_self_and_contacts` | **Kritis**: tambah RLS policy ke 15 tabel yang sebelumnya nol policy (deny-all) — `user_profiles`, gerbang PIN, presence, settings, dll. Semua dibatasi `auth.uid()`/kontak sendiri, bukan `USING(true)`. Tambah helper `my_profile_id()`, `is_conversation_member()`. Daftarkan `chat_messages`, `conversations`, `user_presence`, `chat_typing_status`, `chat_unread_counts` ke realtime publication (sebelumnya kosong total). |
| 33 | 27 Agu, malam | `add_accept_invite_and_ensure_settings_rpc` | RPC `accept_contact_invite` (invite → kontak dua arah + auto-buat percakapan private) dan `ensure_user_settings` (default row `user_notification_settings`/`media_settings`) |
| 34 | 27 Agu, malam | `add_unique_user_id_session_tables` | Unique constraint `user_id` di `app_entry_sessions`/`app_access_sessions` (dibutuhkan untuk upsert dari frontend) |
| 35 | 28 Agu | `add_admin_default_profile_template` | Tabel `admin_profile_defaults` (singleton) + RPC `admin_set_default_profile_template`, `signup_with_default_profile` — profil awal user baru terisi dari template admin |
| 36 | 28 Agu | `fix_avatars_storage_ownership` | Bucket `avatars`: upload/update sebelumnya bisa oleh siapa saja (tanpa cek kepemilikan folder) — diperbaiki jadi wajib `auth.uid()` cocok path |
| 37 | 28 Agu | `cleanup_redundant_avatar_storage_policies` | **Audit ulang**: policy `avatars owner upload`/`avatars owner delete` dari migrasi #36 ternyata duplikat dengan policy generik `storage_insert_owner`/`storage_delete_owner` yang sudah lama ada (berlaku ke semua bucket). Dihapus, tidak mengubah perilaku akses — cuma rapi-rapi. Policy `avatars owner update` tetap dipertahankan (tidak ada padanan generiknya). |
| 38 | 28 Agu | `final_cleanup_duplicate_gallery_and_permissive_policy` | **Audit ulang**: (a) policy lama `frontend access media cleanup queue` (`USING(true)`) di `media_cleanup_queue` ternyata belum pernah dihapus saat migrasi #32 — jadi restriksi barunya tidak berefek. (b) Ketemu tabel `app_gallery` + fungsi `cleanup_expired_gallery()` — sistem galeri paralel yang tidak pernah dipakai (0 baris, tidak direferensikan frontend maupun `media_cleanup_queue`, pakai konvensi `auth.uid()` langsung yang beda dari `app_gallery_media`). Keduanya dihapus, konsolidasi ke satu sistem galeri (`app_gallery_media`). |

---

## Skema Saat Ini (per tabel)

### Inti Family Messenger (aktif)
- **`user_profiles`** — akun pengguna: `display_name`, `username`, `bio`, `avatar_url`, `role` (owner/admin/member), `is_admin`, `login_pin_hash`, `is_online`, `last_seen`
- **`contacts`** — relasi antar pengguna: `nickname`, `relationship`, `is_blocked`, `is_favorite`
- **`conversations`** — percakapan: `type` (private/group/family), `is_private`, `created_by`
- **`conversation_members`** — keanggotaan percakapan
- **`chat_messages`** — isi pesan: teks/media, status kirim, `reply_to_id`, `is_forwarded`, soft delete
- **`chat_media`** — referensi file media (url, mime, ukuran, durasi)

### Akses & Keamanan
- **`app_entry_sessions`**, **`user_access_settings`** — status verifikasi gerbang kalkulator per user
- **`app_access_sessions`**, **`calculator_access_logs`** — sesi aktif & log tindakan akses

### Presence & Notifikasi
- **`user_presence`** — status online/typing + heartbeat perangkat
- **`user_notification_settings`**, **`notification_templates`**, **`push_notifications`**
- **`chat_typing_status`**, **`chat_unread_counts`**

### Media
- **`media_settings`** — kompresi otomatis, kualitas gambar/video, mode simpan
- **`app_gallery_media`** — media di galeri dalam-app, auto-expire 3 hari
- **`media_cleanup_queue`** — antrean worker pembersihan media

### Admin
- **`contact_invites`** — undangan kontak via kode
- **`admin_contacts`** + fungsi `admin_create/update/delete/list_contact` (terproteksi `is_admin_user`)

### Storage Buckets
| Bucket | Publik | Batas Ukuran | Tipe MIME |
|---|---|---|---|
| `avatars` | Ya | 5 MB | image/png, jpeg, webp, gif |
| `chat-media` | Tidak | 25 MB | image/*, video/mp4/webm, audio/webm/mp4/mpeg/ogg |

---

## Catatan Keamanan & Rekomendasi

1. **RLS permisif**: Hampir semua policy saat ini adalah `USING (true) WITH CHECK (true)` — artinya siapa pun dengan anon key dapat membaca/menulis semua baris. Ini wajar untuk prototipe cepat, tapi untuk pemakaian privat keluarga yang berkelanjutan sebaiknya dipersempit berdasarkan `auth.uid()` agar satu anggota tidak bisa membaca data anggota lain di luar percakapan yang sama.
2. **`login_pin_hash`**: pastikan hashing dilakukan di sisi klien/edge function dengan algoritma yang tepat (bcrypt/argon2), bukan disimpan sebagai teks biasa atau hash lemah.
3. **Duplikasi index**: beberapa index (mis. `idx_chat_messages_conversation_time`, `idx_contacts_user`) dibuat ulang di beberapa migrasi berurutan — tidak berbahaya (`IF NOT EXISTS`) tapi bisa dirapikan.
4. ~~Tabel Fase 1 vs Fase 3~~ — **sudah selesai**: tabel prototipe lama (`messages`, `devices`, `room_members`, `profiles`, `message_hidden_for`, `family_accounts`) dan RPC-nya sudah dihapus (migrasi #29–#30), termasuk kolom yatim `user_profiles.family_id`. Sekarang hanya ada satu model chat aktif.
5. **`app_gallery_media.expires_at`**: pastikan ada cron/edge function terjadwal yang benar-benar mengeksekusi `media_cleanup_queue`, karena kolom `expires_at` sendiri tidak otomatis menghapus baris.

---

## Cara Menjalankan Migrasi Baru

```bash
# Membuat migrasi baru
supabase migration new nama_migrasi_snake_case

# Menerapkan ke database lokal
supabase db reset

# Push ke project (via MCP: gunakan tool apply_migration)
```

Atau melalui MCP Supabase connector: gunakan `apply_migration` dengan `project_id: ewdfgbuqnvfczaqqmzgh`, `name`, dan `query` (SQL DDL).
