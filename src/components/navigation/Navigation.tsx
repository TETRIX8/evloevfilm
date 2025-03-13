import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MobileMenu } from "./MobileMenu";
import { DesktopMenu } from "./DesktopMenu";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Navigation() {
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
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      return;
    }

    setIsAdmin(data?.role === 'admin');
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <MobileMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              EVLOEVFILM
            </Link>
          </motion.div>
          <DesktopMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}
