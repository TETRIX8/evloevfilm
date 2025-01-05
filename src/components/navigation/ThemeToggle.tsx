import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isExploding, setIsExploding] = useState(false);

  const handleThemeChange = (checked: boolean) => {
    setIsExploding(true);
    setTimeout(() => {
      setTheme(checked ? "dark" : "light");
      setIsExploding(false);
    }, 500);
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {theme === "dark" ? "Темная" : "Светлая"}
      </span>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={handleThemeChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}