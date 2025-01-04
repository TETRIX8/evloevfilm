import { Switch } from "@/components/ui/switch";

interface ThemeToggleProps {
  theme: string;
  onThemeChange: (checked: boolean) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {theme === "dark" ? "Темная" : "Светлая"}
      </span>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={onThemeChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}