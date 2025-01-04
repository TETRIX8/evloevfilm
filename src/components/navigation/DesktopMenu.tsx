import { Button } from "@/components/ui/button";
import { Bookmark, Film, History, Info, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface DesktopMenuProps {
  isAuthenticated: boolean;
}

export function DesktopMenu({ isAuthenticated }: DesktopMenuProps) {
  return (
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
  );
}