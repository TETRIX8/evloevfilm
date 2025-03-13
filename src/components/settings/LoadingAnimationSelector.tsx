
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Play, Pause } from "lucide-react";
import { useState } from "react";
import { soundEffects } from "@/utils/soundEffects";
import { LoadingPreview } from "./LoadingPreview";

interface LoadingAnimationProps {
  selected: string;
  onSelect: (animation: string) => void;
}

export function LoadingAnimationSelector({ 
  selected, 
  onSelect 
}: LoadingAnimationProps) {
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);
  
  const animationOptions = [
    {
      id: "default",
      name: "Стандартная",
      description: "Вращающиеся звезды и логотип"
    },
    {
      id: "minimal",
      name: "Минималистичная",
      description: "Простая анимация загрузки"
    },
    {
      id: "pulse",
      name: "Пульсация",
      description: "Пульсирующий эффект логотипа"
    },
    {
      id: "cascade",
      name: "Каскад",
      description: "Каскадный эффект появления элементов"
    },
    {
      id: "glitch",
      name: "Глитч",
      description: "Эффект цифрового искажения"
    }
  ];

  const handleSelectAnimation = (animationId: string) => {
    onSelect(animationId);
    soundEffects.play("click");
    localStorage.setItem("loadingAnimation", animationId);
  };
  
  const togglePreview = (animationId: string) => {
    if (previewAnimation === animationId) {
      setPreviewAnimation(null);
    } else {
      setPreviewAnimation(animationId);
      soundEffects.play("click");
    }
  };

  return (
    <div className="space-y-6">
      {previewAnimation && (
        <div className="relative border rounded-lg overflow-hidden h-64 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2 z-10"
            onClick={() => setPreviewAnimation(null)}
          >
            Закрыть
          </Button>
          <LoadingPreview animation={previewAnimation} />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {animationOptions.map((animation) => (
          <motion.div
            key={animation.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`relative p-4 rounded-lg border-2 ${
              selected === animation.id ? "border-primary" : "border-border"
            }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{animation.name}</h3>
                  <p className="text-sm text-muted-foreground">{animation.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePreview(animation.id)}
                  >
                    {previewAnimation === animation.id ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Предпросмотр
                  </Button>
                  <Button
                    variant={selected === animation.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectAnimation(animation.id)}
                  >
                    {selected === animation.id && <Check className="h-4 w-4 mr-1" />}
                    Выбрать
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
