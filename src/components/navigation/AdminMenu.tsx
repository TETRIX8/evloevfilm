import { BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AdminMenuProps {
  isAdmin: boolean;
}

export function AdminMenu({ isAdmin }: AdminMenuProps) {
  if (!isAdmin) return null;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Button variant="ghost" className="gap-2" asChild>
        <Link to="/admin">
          <BarChart className="h-4 w-4" />
          Админ панель
        </Link>
      </Button>
    </motion.div>
  );
}