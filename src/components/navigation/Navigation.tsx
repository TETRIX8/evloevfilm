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
    setIsAuthenticated(!!firebaseUser);
    if (firebaseUser) {
      checkFirebaseAdminStatus(firebaseUser.email);
    } else {
      setIsAdmin(false);
    }
  }, [firebaseUser]);

  const checkFirebaseAdminStatus = async (email: string | null) => {
    if (email) {
      const adminEmails = ["admin@evloevfilm.com", "tetrixuno@gmail.com"];
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
    <nav className="cinema-nav fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl">
      <div className="container flex h-[4.5rem] items-center justify-between px-4 md:h-20 md:px-6">
        <div className="flex items-center gap-2 md:gap-5">
          <MobileMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 360, damping: 18 }}
            className="flex-shrink-0"
          >
            <Link
              to="/"
              className="cinema-wordmark bg-gradient-to-r from-primary via-amber-100 to-primary bg-clip-text text-lg font-bold text-transparent md:text-xl"
            >
              EVLOEVFILM
            </Link>
          </motion.div>
          <DesktopMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <ThemeToggle />
          <FirebaseUserInfo onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}
