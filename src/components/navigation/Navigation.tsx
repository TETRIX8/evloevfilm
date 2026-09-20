import { Clapperboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
    setIsAuthenticated(Boolean(firebaseUser));
    const adminEmails = ["admin@evloevfilm.com", "tetrixuno@gmail.com"];
    setIsAdmin(Boolean(firebaseUser?.email && adminEmails.includes(firebaseUser.email.toLowerCase())));
  }, [firebaseUser]);

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch {
      toast.error("Не удалось выйти из аккаунта");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#0b0d12]/85 backdrop-blur-xl">
      <nav className="container flex h-[72px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10" aria-label="Основная навигация">
        <div className="flex min-w-0 items-center gap-3 lg:gap-7">
          <MobileMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          <Link to="/" className="group inline-flex shrink-0 items-center gap-2" aria-label="EVLOEVFILM — главная">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_22px_hsl(var(--primary)/0.15)] transition-transform group-hover:-rotate-6 group-hover:scale-105">
              <Clapperboard className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-semibold tracking-[-0.08em] text-foreground sm:text-base">EVLOEVFILM</span>
          </Link>
          <DesktopMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <FirebaseUserInfo onLogout={handleLogout} />
        </div>
      </nav>
    </header>
  );
}
