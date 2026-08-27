# Backend Contract — My Calculator (Family Chat)

**Project ref:** `ewdfgbuqnvfczaqqmzgh`
**Untuk:** tim/AI frontend builder — referensi kontrak data agar UI konsisten dengan skema backend Supabase.

> Dokumen ini hanya mendeskripsikan **kontrak** (struktur tabel, fungsi, storage). Untuk histori perubahan schema, lihat `migration.md`.

---

## 1. Alur Autentikasi & Gerbang Kalkulator

Aplikasi punya dua lapis akses:

1. **Auth Supabase standar** → menghasilkan `auth_user_id`, dipetakan ke baris di `user_profiles`.
2. **Gerbang kalkulator (PIN)** → lapisan tambahan di atas auth, dicek terpisah dari sesi Supabase.

### Tabel terkait

**`user_access_settings`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| `user_id` | uuid (PK, FK → user_profiles.id) | |
| `require_calculator_entry` | boolean, default `true` | apakah user ini wajib lewat gerbang kalkulator |

**`app_entry_sessions`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `verified_from_calculator` | boolean | |
| `session_token` | text | token sesi setelah PIN benar |
| `device_id` | text | |
| `last_verified_at` | timestamptz | |

**`app_access_sessions`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `verified_at` | timestamptz | |
| `last_calculator_entry` | timestamptz | |
| `device_id` | text | |
| `is_active` | boolean | |

**`calculator_access_logs`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `action` | text | mis. `"pin_success"`, `"pin_fail"`, `"dashboard_open"` (bebas, tidak di-enforce constraint) |
| `device_id` | text | |
| `created_at` | timestamptz | |

**PIN disimpan di `user_profiles.login_pin_hash`** (text) — frontend **wajib hash PIN sebelum dikirim**, jangan pernah mengirim PIN mentah ke tabel manapun.

### Alur yang disarankan untuk frontend
1. User buka layar kalkulator → input kombinasi PIN.
2. Frontend hitung hash PIN, bandingkan/insert ke alur verifikasi (idealnya lewat Edge Function, bukan langsung compare di client).
3. Jika cocok → insert/update baris di `app_entry_sessions` & `app_access_sessions` (`is_active = true`), catat ke `calculator_access_logs`.
4. Baru setelah itu frontend boleh route ke dashboard chat.

---

## 2. Profil Pengguna

**`user_profiles`**
| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `auth_user_id` | uuid | | link ke `auth.users` |
| `display_name` | text | `'Pengguna Baru'` | |
| `username` | text | | |
| `bio` | text | | |
| `avatar_url` | text | | |
| `avatar_updated_at` | timestamptz | `now()` | |
| `role` | text | `'member'` | enum: `owner` \| `admin` \| `member` |
| `is_admin` | boolean | `false` | |
| `login_pin_hash` | text | | |
| `pin_updated_at` | timestamptz | | |
| `is_online` | boolean | `false` | |
| `last_seen` | timestamptz | | |
| `created_at`, `updated_at` | timestamptz | `now()` | |

---

## 3. Kontak

**`contacts`**
| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | uuid PK | | |
| `user_id` | uuid FK → user_profiles | | |
| `contact_user_id` | uuid FK → user_profiles | | |
| `relationship` | text | `'family'` | |
| `nickname` | text | | nama panggilan custom |
| `is_blocked` | boolean | `false` | |
| `is_favorite` | boolean | `false` | |
| `created_at` | timestamptz | `now()` | |

Unique constraint: `(user_id, contact_user_id)`.

**`contact_invites`** — undangan kontak baru via kode
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `created_by` | uuid FK | |
| `name`, `phone`, `email` | text | data kontak yang diundang |
| `invite_code` | text, unique | dibagikan ke calon kontak |
| `status` | text | `pending` \| `accepted` \| `blocked` |
| `accepted_at` | timestamptz | |

---

## 4. Percakapan & Pesan

**`conversations`**
| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | uuid PK | | |
| `type` | text | `'private'` | `private` \| `group` \| `family` |
| `title` | text | | dipakai untuk group/family |
| `is_private` | boolean | `true` | |
| `created_by` | uuid FK | | |
| `updated_at` | timestamptz | `now()` | update tiap ada pesan baru — pakai ini untuk sort chat list |

**`conversation_members`**
| Kolom | Tipe |
|---|---|
| `conversation_id` | uuid FK, PK bagian 1 |
| `user_id` | uuid FK, PK bagian 2 |
| `joined_at` | timestamptz |

**`chat_messages`**
| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | uuid PK | | |
| `conversation_id` | uuid FK | | |
| `sender_id` | uuid FK | | |
| `content` | text | | nullable jika pesan media |
| `message_type` | text | `'text'` | `text`\|`image`\|`video`\|`audio`\|`voice`\|`document` |
| `status` | text | `'sent'` | `sent`\|`delivered`\|`read` |
| `delivered_at`, `read_at` | timestamptz | | |
| `is_deleted` | boolean | `false` | soft delete |
| `reply_to_id` | uuid FK → chat_messages | | thread reply |
| `is_forwarded` | boolean | `false` | |
| `media_url`, `media_thumbnail_url` | text | | |
| `media_size` | bigint | | bytes |
| `media_duration` | integer | | detik, untuk audio/video |
| `created_at` | timestamptz | `now()` | |

Realtime: `chat_messages` punya `REPLICA IDENTITY FULL` → subscribe langsung untuk update status kirim/baca real-time.

**`chat_media`** — metadata file terpisah (opsional dipakai selain kolom media di `chat_messages`)
| Kolom | Tipe |
|---|---|
| `id` | uuid PK |
| `message_id` | uuid FK → chat_messages |
| `file_url`, `file_name`, `mime_type` | text |
| `file_size` | bigint |
| `duration` | integer |

---

## 5. Presence, Typing, Unread

**`user_presence`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| `user_id` | uuid FK, unique | |
| `status` | text | `online`\|`offline`\|`away`\|`typing` |
| `last_active` | timestamptz | |
| `device_time`, `device_timezone` | timestamptz/text | dikirim dari klien untuk akurasi |
| `last_heartbeat` | timestamptz | frontend wajib update berkala (mis. tiap 30 detik) agar status online akurat |

**`chat_typing_status`** — unique per `(conversation_id, user_id)`, kolom `is_typing`.

**`chat_unread_counts`** — unique per `(conversation_id, user_id)`, kolom `unread_count`. Update ini setiap pesan baru masuk / setiap `mark_room_read` dipanggil.

---

## 6. Notifikasi

**`user_notification_settings`** — per user: `message_notifications`, `sound_enabled`, `vibration_enabled` (semua boolean, default `true`).

**`notification_templates`** — template judul/isi notifikasi push. Berisi template `app_update_message` yang sengaja generik ("perlu pembaruan aplikasi") agar isi notifikasi tidak menampilkan cuplikan pesan asli — **frontend push handler harus selalu memakai template ini**, jangan menampilkan `chat_messages.content` langsung di notifikasi OS.

**`push_notifications`** — antrean kirim: `user_id`, `title`, `body`, `is_sent`. Worker terpisah (edge function/cron) yang bertanggung jawab mengirim & menandai `is_sent = true`.

---

## 7. Media, Kompresi, Galeri

**`media_settings`** per user:
| Kolom | Default |
|---|---|
| `auto_compress` | `true` |
| `image_quality` | `75` |
| `video_quality` | `720` |
| `save_mode` | `'app_gallery'` (alternatif: `'device_gallery'`) |

**`app_gallery_media`** — media disalin ke galeri dalam-app:
| Kolom | Keterangan |
|---|---|
| `message_id` | FK → chat_messages |
| `media_url`, `thumbnail_url`, `media_type` (`image`\|`video`) | |
| `expires_at` | default `now() + 3 hari` — frontend sebaiknya tampilkan indikator "akan hilang dalam X hari" |

**`media_cleanup_queue`** — antrean worker penghapus (`scheduled_delete_at`, `processed`). *Frontend tidak berinteraksi langsung, tapi baik untuk tahu media akan benar-benar terhapus lewat proses ini, bukan otomatis dari `expires_at`.*

---

## 8. RPC / Fungsi yang Tersedia untuk Frontend

> Catatan: RPC lama berbasis room-code (`join_room`, `leave_room`, `mark_room_read`, `get_chat_list`, `get_room_messages`) sudah **dihapus permanen** dari database (27 Agu 2026, migrasi `drop_legacy_roomcode_chat_model`) karena tidak pernah punya data dan sudah digantikan model akun. Belum ada RPC pengganti untuk `get_chat_list`/`get_room_messages` di model baru — saat ini frontend perlu query langsung ke `conversations`/`chat_messages`/`conversation_members` (join manual), atau minta dibuatkan RPC baru setara untuk model akun bila dibutuhkan.

### Fungsi admin (khusus role admin, terproteksi `is_admin_user`)

| Fungsi | Parameter | Return |
|---|---|---|
| `is_admin_user(uid)` | uuid | boolean |
| `admin_create_contact(p_admin_id, p_name, p_email, p_phone)` | uuid, text, text, text | uuid (id kontak baru) |
| `admin_update_contact(p_admin_id, p_contact_id, p_name, p_email, p_phone, p_status)` | ... | boolean |
| `admin_delete_contact(p_admin_id, p_contact_id)` | uuid, uuid | boolean |
| `admin_list_contacts(p_admin_id)` | uuid | setof admin_contacts |

Semua fungsi admin akan `raise exception 'not authorized'` jika `p_admin_id` bukan admin — frontend harus menangkap error ini dan menampilkan pesan yang sesuai.

---

## 9. Storage Buckets

| Bucket | Publik | Batas Ukuran | MIME diizinkan | Kegunaan |
|---|---|---|---|---|
| `avatars` | Ya (read publik) | 5 MB | image/png, jpeg, webp, gif | foto profil |
| `chat-media` | Tidak (perlu signed URL) | 25 MB | image/jpeg,png,webp; video/mp4,webm; audio/webm,mp4,mpeg,ogg | lampiran chat |

Untuk `chat-media`, frontend **harus** meminta signed URL (bucket privat) — jangan asumsikan URL publik langsung bisa diakses.

---

## 10. Catatan Penting untuk Frontend Builder

1. **RLS saat ini permisif** (`USING (true)`) di hampir semua tabel — secara teknis frontend bisa query apa saja dengan anon key. Jangan jadikan ini asumsi permanen; filter di sisi query tetap harus benar (mis. selalu `where user_id = currentUser`) karena policy bisa diperketat kapan saja tanpa pemberitahuan ke frontend.
2. **Satu model chat**: model lama berbasis `room_code` sudah dihapus dari database (27 Agu 2026). Sekarang hanya ada satu sumber kebenaran: `conversations` / `chat_messages` / `conversation_members`, berbasis akun (`user_profiles`). Tidak perlu lagi cek dua skema.
3. **PIN gate**: jangan letakkan logika verifikasi PIN penuh di client-side tanpa hashing/edge function — hash PIN ada di `user_profiles.login_pin_hash`, bukan boleh dibandingkan plaintext di JS.
4. **Notifikasi**: selalu pakai `notification_templates`, jangan tampilkan isi pesan asli di push notification OS.
