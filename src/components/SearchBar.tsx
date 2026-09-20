import { useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (term: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({ onSearch, className, placeholder = "Поиск фильмов..." }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const handleClear = () => { setValue(""); onSearch(""); };

  return (
    <div className={cn("relative flex w-full items-center transition-all duration-200", focused && "-translate-y-0.5", className)}>
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-primary" />
      <Input type="search" placeholder={placeholder} className="h-14 rounded-2xl border-white/[0.11] bg-background/80 pl-11 pr-12 text-sm shadow-[0_12px_30px_rgba(0,0,0,.14)] placeholder:text-muted-foreground/80 focus-visible:border-primary/60 sm:text-base" onChange={(event) => { setValue(event.target.value); onSearch(event.target.value); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} value={value} />
      {value && <button type="button" onClick={handleClear} className="absolute right-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white/[0.07] hover:text-foreground" aria-label="Очистить поиск"><SearchX className="h-4 w-4" /></button>}
    </div>
  );
}
