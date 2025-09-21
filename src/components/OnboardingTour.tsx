import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    title: "Добро пожаловать в EVOLVEFILM",
    description: "Ваш персональный помощник в мире кино и сериалов. Давайте познакомимся с основными функциями.",
    position: "center",
  },
  {
    title: "Поиск фильмов",
    description: "Используйте поисковую строку для быстрого поиска любимых фильмов и сериалов. Просто введите название!",
    position: "top",
    element: ".search-bar",
    arrow: { direction: "up", offset: -20 }
  },
  {
    title: "Навигация",
    description: "Используйте меню навигации для перехода между разделами: Главная, Сохраненное и Новинки.",
    position: "left",
    element: "nav",
    arrow: { direction: "left", offset: 20 }
  },
  {
    title: "Сохранение фильмов",
    description: "Нажмите на иконку сердечка рядом с фильмом, чтобы добавить его в избранное. Все сохраненные фильмы доступны в разделе 'Сохраненное'.",
    position: "right",
    element: ".movie-card",
    arrow: { direction: "right", offset: -20 }
  },
  {
    title: "Новинки",
    description: "В разделе 'Новинки' вы найдете последние поступления фильмов, сериалов и мультфильмов. Регулярно проверяйте обновления!",
    position: "bottom",
    element: ".new-releases",
    arrow: { direction: "down", offset: 20 }
  }
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  const renderArrow = (direction: string, offset: number) => {
    const arrowStyles: Record<string, React.CSSProperties> = {
      up: { bottom: offset, left: '50%', transform: 'translateX(-50%) rotate(-45deg)' },
      down: { top: offset, left: '50%', transform: 'translateX(-50%) rotate(135deg)' },
      left: { right: offset, top: '50%', transform: 'translateY(-50%) rotate(-135deg)' },
      right: { left: offset, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute w-6 h-6 border-t-4 border-r-4 border-primary"
        style={arrowStyles[direction]}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <DialogHeader>
              <DialogTitle>{steps[currentStep].title}</DialogTitle>
              <DialogDescription>{steps[currentStep].description}</DialogDescription>
            </DialogHeader>

            {steps[currentStep].arrow && renderArrow(
              steps[currentStep].arrow.direction,
              steps[currentStep].arrow.offset
            )}
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="mt-4">
          <div className="flex justify-between w-full">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? "Далее" : "Завершить"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}