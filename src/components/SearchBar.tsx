import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (term: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center max-w-2xl w-full transition-all duration-300",
        focused ? "scale-105" : "",
        className
      )}
    >
      <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for movies..."
        className="pl-10 bg-secondary/50 border-secondary-foreground/10 backdrop-blur-sm"
        onChange={(e) => onSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}