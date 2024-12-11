import { Menu, Bookmark, Film } from "lucide-react";
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

export function Navigation() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
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
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to="/saved">
                    <Bookmark className="h-4 w-4" />
                    Сохраненные
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to="/new">
                    <Film className="h-4 w-4" />
                    Новинки
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
                <Link to="/new">
                  <Film className="h-4 w-4" />
                  Новинки
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {theme === "dark" ? "Темная" : "Светлая"}
          </span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </nav>
  );
}