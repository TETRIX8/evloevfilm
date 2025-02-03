import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { toast } from "sonner";

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
      // Set the value
      searchInput.value = movieTitle;
      // Create and dispatch an input event to trigger the search
      const event = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(event);
      // Focus the input
      searchInput.focus();
    }
  };

  const handleMovieTitleClick = (movieTitle: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(movieTitle).then(() => {
      toast.success("Название фильма скопировано в буфер обмена");
    }).catch(() => {
      toast.error("Не удалось скопировать название фильма");
    });
    // Also perform the search
    handleMovieClick(movieTitle);
  };

  const renderContent = () => {
    if (!isBot) return message.content;

    // Replace movie titles with clickable spans
    // Looking for patterns like "Movie Title (year)" or just "Movie Title"
    const parts = message.content.split(/(".*?"|«.*?»|\b[^.,!?;\n]+(?:\s+\(\d{4}\))?)/g);
    
    return parts.map((part, index) => {
      // Skip empty parts and punctuation
      if (!part.trim() || /^[.,!?;\s]+$/.test(part)) return part;
      
      // Check if this part looks like a movie title
      const isMovieTitle = /^["«].*?[»"]$/.test(part) || /.*?\(\d{4}\)$/.test(part);
      
      if (isMovieTitle) {
        const movieTitle = part.replace(/^["«]|[»"]$/g, '').trim();
        return (
          <span
            key={index}
            className="text-primary font-medium cursor-pointer hover:text-primary/80 hover:underline"
            onClick={() => handleMovieTitleClick(movieTitle)}
          >
            {part}
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