import MessageBubble from "./MessageBubble";

export default function MessageList({ messages = [] }: { messages?: any[] }) {
  return (
    <div>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          text={message.content}
        />
      ))}
    </div>
  );
}
