import ChatRoomScreen from "@/features/chat/screens/ChatRoomScreen";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return <ChatRoomScreen conversationId={conversationId} />;
}
