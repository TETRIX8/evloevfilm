import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface UserMenuProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function UserMenu({ isAuthenticated, onLogout }: UserMenuProps) {
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
              <DropdownMenuItem onClick={onLogout}>
                Выйти
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/profile">Войти</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}