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
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm"
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
              <Shield className="w-12 h-12 text-purple-400" />
              <Globe className="w-12 h-12 text-blue-400" />
              <Zap className="w-12 h-12 text-yellow-400" />
            </motion.div>

            <motion.h2 
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
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
              className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
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