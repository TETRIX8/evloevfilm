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

  const handleMovieClick = (movieTitle: string) => {
    // Find the search input element
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = movieTitle;
      // Trigger the input event to activate the search
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Focus the input
      searchInput.focus();
    }
  };

  const renderContent = () => {
    if (!isBot) return message.content;

    // Replace evloevfilm mentions with clickable spans
    const parts = message.content.split(/\b(evloevfilm\s+[^.,!?;\n]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('evloevfilm ')) {
        const movieTitle = part.replace('evloevfilm ', '').trim();
        return (
          <span
            key={index}
            className="text-primary underline cursor-pointer hover:text-primary/80"
            onClick={() => handleMovieClick(movieTitle)}
          >
            {movieTitle}
          </span>
        );
      }
      return part;
    });
  };

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
        {renderContent()}
      </div>
    </div>
  );
}