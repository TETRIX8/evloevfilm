import { Menu, Search, UserPlus, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
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
                <Button variant="ghost" className="justify-start gap-2">
                  <Search className="h-4 w-4" />
                  Поиск
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
            Movie Stream
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Регистрация</span>
          </Button>
          <Button variant="default" className="gap-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Вход</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}