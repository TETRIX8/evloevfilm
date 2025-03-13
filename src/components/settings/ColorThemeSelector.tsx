
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { soundEffects } from "@/utils/soundEffects";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  gradient: string;
  primary: string;
}

export function ColorThemeSelector({ 
  selected, 
  onSelect 
}: { 
  selected: string;
  onSelect: (theme: string) => void;
}) {
  const themeOptions: ThemeOption[] = [
    {
      id: "default",
      name: "По умолчанию",
      description: "Стандартная фиолетовая тема",
      gradient: "bg-gradient-to-br from-purple-600 to-indigo-700",
      primary: "bg-purple-600"
    },
    {
      id: "ocean",
      name: "Океан",
      description: "Синие и голубые оттенки",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-600",
      primary: "bg-blue-500"
    },
    {
      id: "sunset",
      name: "Закат",
      description: "Теплые оранжевые и красные тона",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600",
      primary: "bg-orange-500"
    },
    {
      id: "forest",
      name: "Лес",
      description: "Природные зеленые оттенки",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-700",
      primary: "bg-green-500"
    },
    {
      id: "monochrome",
      name: "Монохром",
      description: "Черно-белая и серая палитра",
      gradient: "bg-gradient-to-br from-gray-600 to-gray-800",
      primary: "bg-gray-600"
    },
    {
      id: "neon",
      name: "Неон",
      description: "Яркие неоновые цвета",
      gradient: "bg-gradient-to-br from-pink-500 to-purple-700",
      primary: "bg-pink-500"
    },
    {
      id: "pastel",
      name: "Пастель",
      description: "Мягкие пастельные тона",
      gradient: "bg-gradient-to-br from-pink-300 to-blue-300",
      primary: "bg-pink-300"
    },
    {
      id: "midnight",
      name: "Полночь",
      description: "Темные синие оттенки",
      gradient: "bg-gradient-to-br from-indigo-900 to-blue-900",
      primary: "bg-indigo-900"
    },
    {
      id: "tropical",
      name: "Тропики",
      description: "Яркие тропические цвета",
      gradient: "bg-gradient-to-br from-yellow-400 to-green-500",
      primary: "bg-yellow-400"
    },
    {
      id: "cherry",
      name: "Вишня",
      description: "Насыщенные красные и розовые тона",
      gradient: "bg-gradient-to-br from-red-500 to-pink-600",
      primary: "bg-red-500"
    }
  ];

  const handleSelectTheme = (themeId: string) => {
    onSelect(themeId);
    soundEffects.play("click");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
      {themeOptions.map((theme) => (
        <motion.div
          key={theme.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Button
            variant="outline"
            className={`w-full flex flex-col items-start p-0 h-auto overflow-hidden border-2 ${
              selected === theme.id ? "border-primary" : "border-border"
            }`}
            onClick={() => handleSelectTheme(theme.id)}
          >
            <div 
              className={`w-full h-24 ${theme.gradient}`}
              aria-hidden="true"
            />
            <div className="p-3 text-left">
              <h3 className="font-medium">{theme.name}</h3>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
            {selected === theme.id && (
              <div className="absolute top-2 right-2 bg-background rounded-full p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
