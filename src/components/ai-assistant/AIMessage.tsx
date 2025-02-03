import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface AIMessageProps {
  message: Message;
  isThinking?: boolean;
}

export function AIMessage({ message, isThinking = false }: AIMessageProps) {
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
    // Looking for patterns like:
    // 1. "Movie Title" or «Movie Title»
    // 2. Movie Title (year)
    // 3. Movie Title [year]
    const parts = message.content.split(/(".*?"|«.*?»|\b[^.,!?;\n]+(?:\s+[\(\[]\d{4}[\)\]])?)/g);
    
    return parts.map((part, index) => {
      // Skip empty parts and punctuation
      if (!part.trim() || /^[.,!?;\s]+$/.test(part)) return part;
      
      // Check if this part looks like a movie title
      const isMovieTitle = (
        /^["«].*?[»"]$/.test(part) || // Quoted titles
        /.*?[\(\[]\d{4}[\)\]]$/.test(part) || // Titles with year
        /^[А-ЯA-Z].*/.test(part.trim()) // Capitalized phrases
      );
      
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
          "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
          isBot ? "bg-primary text-primary-foreground" : "bg-muted",
          isThinking && "animate-pulse"
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
        {isThinking ? (
          <div className="flex items-center gap-2">
            <span className="animate-bounce">•</span>
            <span className="animate-bounce delay-100">•</span>
            <span className="animate-bounce delay-200">•</span>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}