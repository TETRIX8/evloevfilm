import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface AIMessageProps {
  message: Message;
}

export function AIMessage({ message }: AIMessageProps) {
  const isBot = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        isBot ? "items-start" : "items-start flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center",
          isBot ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-lg p-3 max-w-[80%]",
          isBot ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}