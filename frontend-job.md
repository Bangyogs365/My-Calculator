# Frontend Structure — My Calculator (Family Chat)

**Untuk:** panduan struktur build frontend, mengacu ke `backendkontrak.md`.
**Asumsi stack:** React + PWA (disesuaikan dari catatan `push_notifications` di backend yang menyebut "PWA push worker"). Kalau stack sebenarnya React Native/Flutter, struktur folder di bawah tetap relevan secara konsep — cuma penamaan file yang beda.

> Kalau stack-nya ternyata beda (Next.js vs Vite/CRA, atau native mobile), bilang saja — aku sesuaikan strukturnya.

---

## 1. Peta Alur Aplikasi (Route Map)

```
/                         → Layar Kalkulator (default, tampilan publik)
   ├─ input kombinasi PIN tersembunyi
   └─ [PIN benar] → redirect ke /dashboard

/dashboard                → Chat list (home setelah gerbang terbuka)
/dashboard/chat/:id       → Ruang percakapan
/dashboard/contacts       → Daftar kontak
/dashboard/contacts/invite → Buat/terima undangan kontak
/dashboard/profile        → Profil sendiri (nama, avatar, bio, ubah PIN)
/dashboard/settings       → Notifikasi, media, keamanan
/dashboard/gallery        → App gallery (media yang tersimpan, expire 3 hari)
/dashboard/admin          → Panel admin (hanya jika is_admin) — kelola admin_contacts
```

**Prinsip penting:** app harus terlihat 100% seperti kalkulator berfungsi normal di layar `/`. Jangan render elemen dashboard apapun di DOM/tree sebelum PIN terverifikasi — bukan cuma disembunyikan lewat CSS (`display:none`), karena itu tetap bisa ketahuan lewat inspect element / view-source.

---

## 2. Struktur Folder

```
src/
├── app/                          # routing & layout tingkat atas
│   ├── CalculatorGate.tsx        # entry point "/" — kalkulator asli + deteksi kombinasi PIN
│   └── DashboardLayout.tsx       # shell setelah lolos gerbang (nav bawah, header)
│
├── features/
│   ├── calculator/
│   │   ├── CalculatorScreen.tsx
│   │   ├── useCalculatorEngine.ts     # logika hitung asli (harus benar2 berfungsi)
│   │   └── usePinGateDetector.ts      # deteksi urutan tombol = PIN → trigger auth
│   │
│   ├── auth-gate/
│   │   ├── verifyPin.ts               # hash + panggil edge function verifikasi
│   │   ├── entrySession.ts            # kelola app_entry_sessions / app_access_sessions
│   │   └── accessLog.ts               # tulis ke calculator_access_logs
│   │
│   ├── chat-list/
│   │   ├── ChatListScreen.tsx
│   │   ├── ChatListItem.tsx
│   │   └── useChatList.ts             # query conversations + last message + unread
│   │
│   ├── chat-room/
│   │   ├── ChatRoomScreen.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MediaAttachment.tsx        # handle image/video/audio/voice/document
│   │   ├── ViewOnceMediaViewer.tsx    # tampilan khusus pesan sekali-lihat
│   │   ├── TypingIndicator.tsx
│   │   └── useMessages.ts             # subscribe realtime chat_messages
│   │
│   ├── contacts/
│   │   ├── ContactListScreen.tsx
│   │   ├── ContactInviteScreen.tsx
│   │   └── useContacts.ts
│   │
│   ├── profile/
│   │   ├── ProfileScreen.tsx
│   │   ├── AvatarUploader.tsx
│   │   └── ChangePinForm.tsx
│   │
│   ├── gallery/
│   │   ├── GalleryScreen.tsx
│   │   └── useGalleryMedia.ts         # app_gallery_media, tampilkan sisa waktu expire
│   │
│   ├── settings/
│   │   ├── NotificationSettingsScreen.tsx
│   │   └── MediaSettingsScreen.tsx    # auto_compress, quality, save_mode
│   │
│   └── admin/
│       ├── AdminContactsScreen.tsx
│       └── useAdminContacts.ts        # panggil admin_create/update/delete/list_contact
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── realtime.ts                # helper subscribe channel per conversation
│   │   └── storage.ts                 # upload avatar / chat-media, signed URL untuk chat-media
│   ├── crypto/
│   │   └── hashPin.ts                 # hash PIN sebelum kirim ke backend
│   └── push/
│       └── registerPush.ts            # daftar service worker + subscribe push_notifications
│
├── stores/                       # state management (Zustand/Context, pilih salah satu)
│   ├── sessionStore.ts           # status gerbang terbuka/tertutup, session_token
│   ├── presenceStore.ts          # online/typing/last_seen milik kontak yang sedang dilihat
│   └── unreadStore.ts            # badge counter dari chat_unread_counts
│
├── components/ui/                # tombol, modal, avatar, dst (reusable, tanpa logic bisnis)
│
└── service-worker.ts             # push notification handler — WAJIB pakai notification_templates,
                                   # jangan render chat_messages.content di notifikasi OS
```

---

## 3. Detail per Layar & Data yang Dibutuhkan

| Layar | Tabel/RPC yang dipakai | Catatan |
|---|---|---|
| Kalkulator (`/`) | `user_access_settings`, `app_entry_sessions` | Kalkulator harus berfungsi 100% normal; deteksi PIN berjalan di background tanpa mengubah tampilan |
| Chat list | `conversations`, `conversation_members`, `chat_messages` (last message), `chat_unread_counts` | Belum ada RPC gabungan pengganti `get_chat_list` lama — perlu query join manual atau minta RPC baru (lihat bagian 5) |
| Ruang chat | `chat_messages`, `chat_media`, `chat_typing_status`, realtime subscribe | Subscribe ke `chat_messages` filter `conversation_id`, dengarkan INSERT + UPDATE (status baca) |
| Kontak | `contacts`, `contact_invites` | Cek `is_blocked` sebelum tampilkan kontak di UI kirim pesan |
| Profil | `user_profiles`, bucket `avatars` | Ubah PIN → hash ulang, update `login_pin_hash` + `pin_updated_at` |
| Galeri | `app_gallery_media` | Tampilkan countdown dari `expires_at`, jangan janjikan media permanen |
| Settings | `user_notification_settings`, `media_settings` | |
| Admin | `admin_contacts` via RPC `admin_*` | Route ini harus dicek `is_admin` di client **dan** RLS/RPC tetap validasi ulang di server (jangan percaya flag client saja) |

---

## 4. State & Realtime

- **Session/gate state**: simpan `session_token` di memory + `sessionStorage` (bukan `localStorage`) supaya otomatis "terkunci" lagi kalau tab/app ditutup — cocok untuk sifat aplikasi ini yang butuh re-entry lewat kalkulator tiap buka baru.
- **Realtime channel per conversation**: subscribe saat masuk `ChatRoomScreen`, unsubscribe saat keluar — jangan subscribe semua percakapan sekaligus di chat list (boros koneksi), cukup dengarkan perubahan `chat_messages.updated_at`/`conversations.updated_at` untuk update badge & preview.
- **Presence heartbeat**: interval 20–30 detik update `user_presence.last_heartbeat` + `last_active`, hanya berjalan saat app di foreground (pause saat app di background untuk hemat baterai/koneksi).
- **Typing indicator**: debounce 2–3 detik sebelum set `is_typing = false` otomatis kalau user berhenti mengetik.

---

## 5. Yang Masih Perlu Diputuskan Sebelum Build Chat List

Karena `get_chat_list` RPC lama sudah dihapus, ada dua opsi untuk chat list:

1. **Query manual di frontend** (join `conversation_members` → `conversations` → `chat_messages` terbaru per percakapan) — lebih fleksibel tapi query-nya cukup kompleks dan butuh beberapa roundtrip.
2. **Minta RPC baru** setara `get_chat_list` tapi untuk model akun (`user_id` bukan `device_id`) — satu roundtrip, lebih cepat, tapi butuh nambah migrasi.

Aku sarankan opsi 2 kalau performa chat list penting (biasanya iya). Mau aku buatkan RPC-nya sekarang?
