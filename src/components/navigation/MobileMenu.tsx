
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, Bookmark, History, Film, Info, HelpCircle, LogIn, BarChart, ShieldOff, MessageSquare, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function MobileMenu({ isAuthenticated, isAdmin }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-4">
          {/* Show profile link regardless of auth status */}
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/profile">
              <User className="h-4 w-4" />
              Профиль
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/saved">
              <Bookmark className="h-4 w-4" />
              Сохраненные
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/history">
              <History className="h-4 w-4" />
              История просмотров
            </Link>
          </Button>
          {isAdmin && (
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link to="/admin">
                <BarChart className="h-4 w-4" />
                Админ панель
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/auth">
              <LogIn className="h-4 w-4" />
              Войти
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/chat">
              <MessageSquare className="h-4 w-4" />
              Онлайн чат
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/new">
              <Film className="h-4 w-4" />
              Новинки
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/about">
              <Info className="h-4 w-4" />
              О нас
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/support">
              <HelpCircle className="h-4 w-4" />
              Поддержка
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/adblock">
              <ShieldOff className="h-4 w-4" />
              Блокировка рекламы
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
