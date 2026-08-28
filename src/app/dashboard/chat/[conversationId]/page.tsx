import DashboardGuard from "@/features/auth-gate/DashboardGuard";
import ChatRoomScreen from "@/features/chat/screens/ChatRoomScreen";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <DashboardGuard>
      <ChatRoomScreen conversationId={conversationId} />
    </DashboardGuard>
  );
}
