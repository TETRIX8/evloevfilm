import { useEffect, useState } from "react";
import { X, CreditCard, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function TBankAdvertisement() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Advertisement Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring",
              duration: 0.5,
              bounce: 0.3
            }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-[500px] md:max-w-[90vw] z-50"
          >
            <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 
                          rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden h-full md:h-auto">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/20 hover:bg-white/30 
                         text-white backdrop-blur-sm rounded-full w-8 h-8 md:w-10 md:h-10"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              {/* Animated Background Circles */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              />

              {/* Content */}
              <div className="relative p-6 md:p-8 flex flex-col items-center text-center h-full justify-center">
                {/* Icon with Animation */}
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="mb-4 md:mb-6"
                >
                  <div className="relative">
                    <CreditCard className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-2 -right-2"
                    >
                      <Gift className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3"
                >
                  Получите 500 ₽
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm md:text-base text-white/90 mb-4 md:mb-6 max-w-md px-2"
                >
                  Оформите дебетовую и кредитную карты T-Bank и получите бонус!
                  <br />
                  <span className="font-semibold">Бесплатное обслуживание навсегда</span>
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto"
                >
                  <a
                    href="https://www.tbank.ru/baf/5j2Mk5oYbpx"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                  >
                    <Button
                      size="lg"
                      className="w-full md:w-auto bg-white text-yellow-600 hover:bg-white/90 
                               font-semibold text-base md:text-lg px-6 md:px-8 py-4 md:py-6 
                               rounded-xl md:rounded-2xl shadow-lg"
                    >
                      Оформить карты
                    </Button>
                  </a>
                </motion.div>

                {/* Small text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs md:text-sm text-white/70 mt-3 md:mt-4"
                >
                  Автоматически закроется через 4 секунды
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
