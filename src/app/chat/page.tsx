import DashboardGuard from "@/features/auth-gate/DashboardGuard";
import ChatListScreen from "@/features/chat/screens/ChatListScreen";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <ChatListScreen />
    </DashboardGuard>
  );
}
