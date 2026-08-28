import { createClient } from "@supabase/supabase-js";

// The calculator can render without authentication configured. Keep the client
// constructible during Next.js prerendering, while real deployments use env vars.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);
