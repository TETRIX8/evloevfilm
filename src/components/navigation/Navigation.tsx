import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MobileMenu } from "./MobileMenu";
import { DesktopMenu } from "./DesktopMenu";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [isExploding, setIsExploding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <MobileMenu isAuthenticated={isAuthenticated} />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              EVOLVEFILM
            </Link>
          </motion.div>
          
          <DesktopMenu isAuthenticated={isAuthenticated} />
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
          <UserMenu isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}