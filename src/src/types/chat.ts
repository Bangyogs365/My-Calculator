export interface ChatProfile {
  id: string;
  display_name: string;
  username?: string;
  avatar_url?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Conversation {
  id: string;
  type: "private" | "group" | "family";
  title?: string;
  updated_at?: string;
  last_message?: {
    content: string;
    created_at: string;
  };
  members?: ChatProfile[];
}