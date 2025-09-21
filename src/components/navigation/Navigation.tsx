import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { toast } from "sonner";
import { MobileMenu } from "./MobileMenu";
import { DesktopMenu } from "./DesktopMenu";
import { ThemeToggle } from "./ThemeToggle";
import { FirebaseUserInfo } from "../FirebaseUserInfo";

export function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { user: firebaseUser, logout: firebaseLogout } = useFirebaseAuth();

  useEffect(() => {
    // Check Firebase authentication status
    setIsAuthenticated(!!firebaseUser);
    if (firebaseUser) {
      checkFirebaseAdminStatus(firebaseUser.email);
    } else {
      setIsAdmin(false);
    }
  }, [firebaseUser]);

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
      await firebaseLogout();
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
          <FirebaseUserInfo onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}
