import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Globe, Zap } from "lucide-react";

interface VPNAdvertisementProps {
  onComplete: () => void;
}

export function VPNAdvertisement({ onComplete }: VPNAdvertisementProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow time for exit animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0c11]/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-center space-y-6 p-8 max-w-2xl mx-auto"
          >
            <motion.div 
              className="flex justify-center gap-6 mb-8"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-12 h-12 text-primary" />
              <Globe className="w-12 h-12 text-primary/75" />
              <Zap className="w-12 h-12 text-primary/50" />
            </motion.div>

            <motion.h2 
              className="font-display text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-4xl"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Защитите свой просмотр с AK VPN
            </motion.h2>

            <motion.p 
              className="text-gray-200 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Безопасный и быстрый доступ к любому контенту
            </motion.p>

            <motion.a
              href="https://akvpn.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl bg-primary px-8 py-3 font-extrabold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Подключить VPN сейчас
            </motion.a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
