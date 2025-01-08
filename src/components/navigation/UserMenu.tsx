import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface UserMenuProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function UserMenu({ isAuthenticated, onLogout }: UserMenuProps) {
  const [adBlockEnabled, setAdBlockEnabled] = useState(() => {
    return localStorage.getItem("adBlockEnabled") === "true";
  });

  useEffect(() => {
    localStorage.setItem("adBlockEnabled", String(adBlockEnabled));
  }, [adBlockEnabled]);

  return (
    <div className="hidden lg:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            {isAuthenticated ? (
              <User className="h-5 w-5" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAuthenticated ? (
            <>
              <DropdownMenuItem asChild>
                <Link to="/profile">Профиль</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex items-center justify-between w-full">
                  <span>Блокировать рекламу</span>
                  <Switch
                    checked={adBlockEnabled}
                    onCheckedChange={setAdBlockEnabled}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                Выйти
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/auth">Войти</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}