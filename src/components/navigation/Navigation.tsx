import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { toast } from "sonner";
import { MobileMenu } from "./MobileMenu";
import { DesktopMenu } from "./DesktopMenu";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { FirebaseUserInfo } from "../FirebaseUserInfo";

export function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMethod, setAuthMethod] = useState<"supabase" | "firebase">("firebase");
  
  const { user: firebaseUser, logout: firebaseLogout } = useFirebaseAuth();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      if (authMethod === "firebase") {
        setIsAuthenticated(!!firebaseUser);
        if (firebaseUser) {
          // For Firebase, we'll assume admin status based on email or other criteria
          checkFirebaseAdminStatus(firebaseUser.email);
        } else {
          setIsAdmin(false);
        }
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setIsAuthenticated(!!session);
          if (session) {
            checkAdminStatus(session.user.id);
          }
        });
      }
    };

    checkAuth();

    if (authMethod === "supabase") {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session);
        if (session) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [authMethod, firebaseUser]);

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

  const checkFirebaseAdminStatus = async (email: string | null) => {
    // For Firebase, you can implement admin check based on email or other criteria
    // For now, we'll check if the email contains 'admin' or is a specific admin email
    if (email) {
      const adminEmails = ['admin@evloevfilm.com', 'tetrixuno@gmail.com'];
      setIsAdmin(adminEmails.includes(email.toLowerCase()));
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (authMethod === "firebase") {
        await firebaseLogout();
      } else {
        await supabase.auth.signOut();
      }
    } catch (error) {
      toast.error("Ошибка при выходе из системы");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              EVLOEVFILM
            </Link>
          </motion.div>
          <DesktopMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {authMethod === "firebase" ? (
            <FirebaseUserInfo onLogout={handleLogout} />
          ) : (
            <UserMenu isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </nav>
  );
}
