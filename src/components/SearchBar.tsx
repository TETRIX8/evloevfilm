import { useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SearchBarProps {
  onSearch: (term: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div
      className={cn(
        "relative flex items-center max-w-2xl w-full transition-all duration-300",
        focused ? "scale-[1.02]" : "",
        className
      )}
    >
      <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Поиск фильмов..."
        className="pl-10 pr-12 bg-secondary/50 border-secondary-foreground/10 backdrop-blur-sm h-12 text-lg"
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={value}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2"
          onClick={handleClear}
        >
          <SearchX className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}