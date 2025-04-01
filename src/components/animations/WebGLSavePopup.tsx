
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { WebGLAnimation } from './WebGLAnimation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface WebGLSavePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  image?: string;
}

export function WebGLSavePopup({ isOpen, onClose, title, image }: WebGLSavePopupProps) {
  const [animationType, setAnimationType] = useState<'particles' | 'stars' | 'nebula'>('stars');
  
  // Randomly select an animation type when the popup opens
  useEffect(() => {
    if (isOpen) {
      const animations: Array<'particles' | 'stars' | 'nebula'> = ['particles', 'stars', 'nebula'];
      const randomIndex = Math.floor(Math.random() * animations.length);
      setAnimationType(animations[randomIndex]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-transparent border-0 shadow-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative backdrop-blur-lg bg-background/70 rounded-lg overflow-hidden border border-primary/20 p-6"
            >
              {/* Background animation */}
              <div className="absolute inset-0 z-0">
                <WebGLAnimation type={animationType} opacity={0.4} />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1 
                    }}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/20 backdrop-blur-sm"
                  >
                    <Check className="h-8 w-8 text-primary" />
                  </motion.div>
                  
                  {image && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative w-20 h-20 rounded-md overflow-hidden"
                    >
                      <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold"
                  >
                    Добавлено в сохраненные
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground"
                  >
                    "{title}" теперь в вашей коллекции
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={onClose}
                      className="min-w-[100px]"
                    >
                      Готово
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
