import { useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SearchBarProps {
  onSearch: (term: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({ onSearch, className, placeholder = "Поиск фильмов..." }: SearchBarProps) {
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
        "cinema-search relative flex w-full max-w-2xl items-center transition-all duration-300",
        focused ? "scale-[1.015]" : "",
        className
      )}
    >
      <Search className="absolute left-4 z-10 h-5 w-5 text-primary/90" />
      <Input
        type="search"
        placeholder={placeholder}
        className="h-14 border-foreground/10 bg-card/70 py-3 pl-12 pr-14 text-base shadow-[0_14px_36px_hsl(229_55%_3%/0.28)] md:text-lg"
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={value}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 h-10 w-10 text-muted-foreground hover:text-primary"
          onClick={handleClear}
          aria-label="Очистить поиск"
        >
          <SearchX className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
