import { supabase } from "@/lib/supabase";

export async function logCalculatorAccess(
  userId: string,
  action: string,
  deviceId: string,
): Promise<void> {
  const { error } = await supabase.from("calculator_access_logs").insert({
    user_id: userId,
    action,
    device_id: deviceId,
  });

  if (error) throw error;
}
