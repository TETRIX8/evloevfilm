
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, User, Bookmark, History, Film, Info, HelpCircle, LogIn, BarChart, ShieldOff, MessageSquare, Settings, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function MobileMenu({ isAuthenticated, isAdmin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const menuSections = [
    {
      title: "Профиль",
      items: [
        { title: "Профиль", url: "/profile", icon: User },
        { title: "Сохраненные", url: "/saved", icon: Bookmark },
        { title: "История просмотров", url: "/history", icon: History },
      ]
    },
    {
      title: "Контент",
      items: [
        { title: "Новинки", url: "/new", icon: Film },
        { title: "Аниме", url: "https://evloevfilmanime.vercel.app/", icon: Zap, external: true },
        { title: "Отзывы", url: "/reviews", icon: MessageSquare },
      ]
    },
    {
      title: "Настройки и поддержка",
      items: [
        { title: "Настройки", url: "/settings", icon: Settings },
        { title: "О нас", url: "/about", icon: Info },
        { title: "Поддержка", url: "/support", icon: HelpCircle },
        { title: "Блокировка рекламы", url: "/adblock", icon: ShieldOff },
      ]
    }
  ];

  if (isAdmin) {
    menuSections[1].items.push({ title: "Админ панель", url: "/admin", icon: BarChart });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden relative">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[300px] sm:w-[350px] p-0 bg-background/95 backdrop-blur-md"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              EVLOEVFILM
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Кнопка входа для неавторизованных пользователей */}
            {!isAuthenticated && (
              <div className="mb-6">
                <Button 
                  className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90" 
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/auth">
                    <LogIn className="h-5 w-5 mr-3" />
                    Войти в аккаунт
                  </Link>
                </Button>
              </div>
            )}

            {/* Секции меню */}
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Button 
                      key={item.title}
                      variant="ghost" 
                      className="w-full justify-start h-12 text-base font-medium px-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200" 
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      {item.external ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <item.icon className="h-5 w-5 mr-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </a>
                      ) : (
                        <Link to={item.url}>
                          <item.icon className="h-5 w-5 mr-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      )}
                    </Button>
                  ))}
                </div>
                {sectionIndex < menuSections.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>

          {/* Нижняя часть меню */}
          <div className="border-t p-6 bg-muted/30">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Версия 2.0
              </p>
              <p className="text-xs text-muted-foreground">
                © 2024 EVLOEVFILM
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
