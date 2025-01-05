import { Menu, Bookmark, Film, History, User, HelpCircle, Info, LogIn, BarChart } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";
import { Switch } from "./ui/switch";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [isExploding, setIsExploding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return;
    }

    setIsAdmin(data?.role === 'admin');
  };

  const handleThemeChange = (checked: boolean) => {
    setIsExploding(true);
    setTimeout(() => {
      setTheme(checked ? "dark" : "light");
      setIsExploding(false);
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Вы успешно вышли из системы");
    } catch (error) {
      toast.error("Ошибка при выходе из системы");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${isExploding ? 'theme-explosion' : ''}`}>
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
                    {isAdmin && (
                      <Button variant="ghost" className="justify-start gap-2" asChild>
                        <Link to="/admin">
                          <BarChart className="h-4 w-4" />
                          Админ панель
                        </Link>
                      </Button>
                    )}
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              EVOLVEFILM
            </Link>
          </motion.div>
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Button variant="ghost" className="gap-2" asChild>
                    <Link to="/saved">
                      <Bookmark className="h-4 w-4" />
                      Сохраненные
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Button variant="ghost" className="gap-2" asChild>
                    <Link to="/history">
                      <History className="h-4 w-4" />
                      История просмотров
                    </Link>
                  </Button>
                </motion.div>
                {isAdmin && (
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <Button variant="ghost" className="gap-2" asChild>
                      <Link to="/admin">
                        <BarChart className="h-4 w-4" />
                        Админ панель
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </>
            ) : null}
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button variant="ghost" className="gap-2" asChild>
                <Link to="/new">
                  <Film className="h-4 w-4" />
                  Новинки
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button variant="ghost" className="gap-2" asChild>
                <Link to="/about">
                  <Info className="h-4 w-4" />
                  О нас
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button variant="ghost" className="gap-2" asChild>
                <Link to="/support">
                  <HelpCircle className="h-4 w-4" />
                  Поддержка
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {theme === "dark" ? "Темная" : "Светлая"}
          </span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={handleThemeChange}
            className="data-[state=checked]:bg-primary"
          />
          
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
                    <DropdownMenuItem onClick={handleLogout}>
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
        </div>
      </div>
    </nav>
  );
}