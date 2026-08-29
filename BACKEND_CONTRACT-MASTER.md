# SKY-SECURE CHAT
# MASTER BACKEND & APPLICATION CONTRACT

Version: v1.0 Production Blueprint

---

# 1. Project Identity

## Application

Sky-Secure Chat

## Purpose

Secure communication platform built with realtime messaging, presence, typing indicator, media attachment, and read receipt.

## Technology Stack

Frontend:
- Next.js / React
- TypeScript
- CSS Design System

Backend:
- Supabase

Database:
- PostgreSQL

Realtime:
- Supabase Realtime

Storage:
- Supabase Storage

Authentication:
- Supabase Auth
- app_access_sessions

---

# 2. System Architecture

```
USER

 |

Calculator Unlock

 |

v

app_access_sessions

 |

v

AuthContext

 |

Dashboard

 |

Chat System

 |

+----------------+
|                |
Messages      Presence
|
Typing
```

---

# 3. Supabase Contract

Environment:

- Production Supabase Project
- PostgreSQL Database
- Realtime Enabled
- Storage Enabled

Do not expose:
- service role key
- private credentials

---

# 4. Database Schema Contract

## app_access_sessions

Purpose:
Session akses aplikasi setelah unlock.

Fields:

- id
- user_id
- device_id
- device_name
- ip_address
- user_agent
- created_at
- expires_at
- is_active
- ended_at

Usage:
- AuthContext
- Access validation

---

## user_profiles

Purpose:
Data profil pengguna.

Fields:

- id
- display_name
- username
- avatar_url
- is_online
- last_seen

Usage:
- Dashboard
- Chat header
- Presence

---

## conversations

Purpose:
Master ruang chat.

Fields:

- id
- conversation_type
- title
- created_at
- created_by
- updated_at
- is_private
- deleted_at
- deleted_by

Types:

- private
- group
- project

---

## conversation_members

Purpose:
Relasi user dan conversation.

Fields:

- conversation_id
- user_id
- joined_at

---

## chat_messages

Purpose:
Penyimpanan pesan.

Fields:

- id
- conversation_id
- sender_id
- content
- message_type
- status
- created_at
- delivered_at
- read_at
- media_url
- media_thumbnail_url
- media_size
- media_duration
- reply_to_id

---

# 5. Relationship Map

```
user_profiles

      |

      v

conversation_members

      |

      v

conversations

      |

      v

chat_messages

      |

      v

chat_media
```

---

# 6. Message Lifecycle

```
sent

 |

v

delivered

 |

v

read
```

Message Types:

- text
- image
- video
- audio
- document

---

# 7. Realtime Contract

## Message Channel

Table:

chat_messages

Events:

- INSERT
- UPDATE
- DELETE


Frontend:

useRealtimeMessages()

---

# 8. Typing Indicator Contract

Table:

chat_typing_status

Fields:

- conversation_id
- user_id
- is_typing
- updated_at


Flow:

User typing

↓

Update status

↓

Realtime broadcast

↓

Other user receives indicator

---

# 9. Presence Contract

Table:

user_presence

Fields:

- user_id
- status
- last_active
- updated_at
- device_time
- device_timezone


Status:

- online
- offline
- away

---

# 10. Read Receipt Contract

Source:

chat_messages


Fields:

- status
- read_at


UI:

sent:
✓

delivered:
✓✓

read:
✓✓ blue

---

# 11. Media Storage Contract

Storage:

Supabase Storage


Bucket:

chat-media


Flow:

```
Select File

↓

Upload Storage

↓

Get URL

↓

Insert chat_messages
```


Supported:

- image
- video
- audio
- document

---

# 12. Frontend Service Contract

Location:

src/features/chat/services


## messageService.ts

Functions:

- sendMessage()
- getMessages()
- markRead()
- deleteMessage()


## mediaService.ts

Functions:

- uploadChatMedia()
- deleteMedia()

---

# 13. Hook Contract

Location:

src/features/chat/hooks


## useChatList()

Input:

userId


Output:

- conversations
- partner profile
- last message
- unread count


Source:

- conversations
- conversation_members
- user_profiles
- chat_messages


---

## useRealtimeMessages()

Input:

conversationId


Output:

- messages
- loading


---

## useTypingStatus()

Input:

- conversationId
- userId


Output:

- isTyping


---

## usePresence()

Input:

userId


Output:

- online users

---

# 14. UI Contract

## Dashboard

Components:

```
ChatDashboard

├── Header
├── Tabs
├── ConversationList
├── BottomNavigation
```


## Chat Room

Components:

```
ChatRoom

├── ChatHeader
├── MessageList
├── MessageBubble
├── TypingIndicator
├── Composer
└── AttachmentPreview
```

---

# 15. Security Contract

Rules:

- RLS must remain enabled.
- User can only access conversations where user is a member.
- Frontend accesses database through service layer.
- No hardcoded data.

---

# 16. Development Rules

Before creating features:

1. Read this document.
2. Verify schema.
3. Create migration if schema changes.
4. Create service.
5. Create hook.
6. Create UI.


Never assume:

- table name
- column name
- relationship
- enum value

---

# 17. Migration History

Maintain:

```
001_initial_schema

002_chat_messages

003_realtime

004_storage

005_security
```

---

# 18. Deployment Contract

Required:

- Environment variables
- Supabase configuration
- Production build verification

---

# 19. Future Extension

Reserved:

- voice call
- video call
- encryption layer
- multi device sync
- AI assistant

---

END OF MASTER CONTRACT
