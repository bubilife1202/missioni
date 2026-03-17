import { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-white border border-slate-200 text-slate-900 rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
