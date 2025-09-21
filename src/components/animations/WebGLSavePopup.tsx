
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
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
  const [animationType, setAnimationType] = useState<'particles' | 'stars' | 'nebula' | 'galaxy' | 'fireflies' | 'aurora'>('stars');
  
  // Randomly select an animation type when the popup opens
  useEffect(() => {
    if (isOpen) {
      const animations: Array<'particles' | 'stars' | 'nebula' | 'galaxy' | 'fireflies' | 'aurora'> = 
        ['particles', 'stars', 'nebula', 'galaxy', 'fireflies', 'aurora'];
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
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
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
                      className="relative w-24 h-32 rounded-md overflow-hidden shadow-xl"
                    >
                      <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 right-0 bg-primary/80 p-1 rounded-bl-md">
                        <Star className="h-4 w-4 text-white fill-white" />
                      </div>
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
                    className="flex gap-2"
                  >
                    <Button
                      onClick={onClose}
                      className="min-w-[100px] bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300"
                    >
                      Отлично!
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
