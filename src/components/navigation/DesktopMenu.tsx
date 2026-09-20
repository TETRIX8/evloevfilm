import { Compass, Film, MessageCircle, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DesktopMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const primaryLinks = [
  { title: "Главная", url: "/", icon: Compass },
  { title: "Новинки", url: "/new", icon: Film },
  { title: "Аниме", url: "https://evloevfilmanime.vercel.app/", icon: Zap, external: true },
  { title: "Чат", url: "/chat", icon: MessageCircle },
];

export function DesktopMenu(_: DesktopMenuProps) {
  const location = useLocation();

  return (
    <div className="hidden items-center gap-1 xl:flex" aria-label="Разделы каталога">
      {primaryLinks.map((item) => {
        const Icon = item.icon;
        const active = !item.external && location.pathname === item.url;
        const className = cn(
          "nav-link gap-2",
          active && "bg-white/[0.08] text-foreground"
        );

        return item.external ? (
          <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className={className}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {item.title}
          </a>
        ) : (
          <Link key={item.title} to={item.url} className={className}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
