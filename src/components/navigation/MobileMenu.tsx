import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Bookmark, History, Film, Info, HelpCircle, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export function MobileMenu({ isAuthenticated }: MobileMenuProps) {
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
          {isAuthenticated ? (
            <>
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
            </>
          ) : (
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link to="/profile">
                <LogIn className="h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/new">
              <Film className="h-4 w-4" />
              Новинки
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
        </div>
      </SheetContent>
    </Sheet>
  );
}