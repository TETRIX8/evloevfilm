import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, User, Bookmark, History, Film, Info, HelpCircle, LogIn, BarChart, MessageCircle, Settings, X, Zap, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function MobileMenu({ isAuthenticated, isAdmin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuSections = [
    {
      title: "Каталог",
      items: [
        { title: "Главная", url: "/", icon: Compass },
        { title: "Новинки", url: "/new", icon: Film },
        { title: "Аниме", url: "https://evloevfilmanime.vercel.app/", icon: Zap, external: true },
      ],
    },
    {
      title: "Моё кино",
      items: [
        { title: "Профиль", url: "/profile", icon: User },
        { title: "Избранное", url: "/saved", icon: Bookmark },
        { title: "История", url: "/history", icon: History },
        { title: "Чат", url: "/chat", icon: MessageCircle },
      ],
    },
    {
      title: "Помощь",
      items: [
        { title: "Настройки", url: "/settings", icon: Settings },
        { title: "О сервисе", url: "/about", icon: Info },
        { title: "Поддержка", url: "/support", icon: HelpCircle },
      ],
    },
  ];

  if (isAdmin) menuSections[1].items.push({ title: "Админ-панель", url: "/admin", icon: BarChart });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative -ml-2 lg:hidden" aria-label="Открыть меню">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[310px] flex-col border-r-white/[0.08] bg-[#111318] p-0 text-foreground sm:w-[360px]">
        <SheetHeader className="border-b border-white/[0.08] px-6 py-5 text-left">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="font-display text-base font-semibold tracking-[-0.07em] text-foreground">EVLOEVFILM</SheetTitle>
              <p className="mt-1 text-xs text-muted-foreground">Кино, выбранное для вас</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-9 w-9" aria-label="Закрыть меню">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {!isAuthenticated && (
            <Link to="/auth" onClick={() => setOpen(false)} className="mb-7 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground">
              <LogIn className="h-4 w-4" /> Войти в аккаунт
            </Link>
          )}

          <div className="space-y-6">
            {menuSections.map((section, index) => (
              <div key={section.title}>
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">{section.title}</p>
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = !item.external && location.pathname === item.url;
                    const itemClass = cn(
                      "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground",
                      active && "bg-white/[0.08] text-foreground"
                    );
                    return item.external ? (
                      <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className={itemClass}>
                        <Icon className="h-4 w-4 text-primary" /> {item.title}
                      </a>
                    ) : (
                      <Link key={item.title} to={item.url} onClick={() => setOpen(false)} className={itemClass}>
                        <Icon className="h-4 w-4 text-primary" /> {item.title}
                      </Link>
                    );
                  })}
                </div>
                {index < menuSections.length - 1 && <Separator className="mt-5 bg-white/[0.07]" />}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.08] px-6 py-5">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EVLOEVFILM</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
