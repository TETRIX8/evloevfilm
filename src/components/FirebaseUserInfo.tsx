import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bookmark, History, LogIn, LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

interface FirebaseUserInfoProps {
  onLogout: () => void;
}

export function FirebaseUserInfo({ onLogout }: FirebaseUserInfoProps) {
  const { user } = useFirebaseAuth();

  if (!user) {
    return (
      <Button asChild className="h-10 rounded-xl px-3.5 text-xs sm:px-4 sm:text-sm">
        <Link to="/auth"><LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Войти</span></Link>
      </Button>
    );
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
    return email?.[0].toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/[0.10] bg-white/[0.04] p-0" aria-label="Открыть меню профиля">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Пользователь"} />
            <AvatarFallback className="bg-primary/20 text-xs font-extrabold text-primary">{getInitials(user.displayName, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl border-white/[0.10] bg-popover p-2 shadow-2xl">
        <DropdownMenuLabel className="p-2.5 font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9"><AvatarImage src={user.photoURL || undefined} /><AvatarFallback className="bg-primary/20 font-extrabold text-primary">{getInitials(user.displayName, user.email)}</AvatarFallback></Avatar>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{user.displayName || "Пользователь"}</p><p className="truncate pt-0.5 text-xs text-muted-foreground">{user.email}</p></div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/profile"><User className="mr-2 h-4 w-4 text-primary" />Профиль</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/saved"><Bookmark className="mr-2 h-4 w-4 text-primary" />Избранное</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/history"><History className="mr-2 h-4 w-4 text-primary" />История</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4 text-primary" />Настройки</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Выйти</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
