
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Sparkles, Waves, Cloud, Stars, Atom, Flame, Umbrella, Palette } from "lucide-react";
import { WebGLAnimation } from "../animations/WebGLAnimation";

interface WebGLAnimationSelectorProps {
  selected: string;
  opacity: number;
  onSelect: (value: string) => void;
  onOpacityChange: (value: number) => void;
}

export function WebGLAnimationSelector({ 
  selected, 
  opacity,
  onSelect,
  onOpacityChange 
}: WebGLAnimationSelectorProps) {
  const [previewType, setPreviewType] = useState<string | null>(null);
  
  const animations = [
    { id: "none", name: "Отключено", icon: <div className="w-5 h-5" /> },
    { id: "particles", name: "Частицы", icon: <Sparkles className="w-5 h-5" /> },
    { id: "waves", name: "Волны", icon: <Waves className="w-5 h-5" /> },
    { id: "nebula", name: "Туманность", icon: <Cloud className="w-5 h-5" /> },
    { id: "stars", name: "Звезды", icon: <Stars className="w-5 h-5" /> },
    { id: "galaxy", name: "Галактика", icon: <Atom className="w-5 h-5" /> },
    { id: "fireflies", name: "Светлячки", icon: <Flame className="w-5 h-5 text-yellow-400" /> },
    { id: "aurora", name: "Северное сияние", icon: <Palette className="w-5 h-5 text-green-400" /> },
    { id: "rain", name: "Дождь", icon: <Umbrella className="w-5 h-5 text-blue-400" /> }
  ];

  const handlePreview = (type: string) => {
    if (type === 'none') {
      setPreviewType(null);
    } else {
      setPreviewType(type);
    }
  };

  const handleOpacityChange = (values: number[]) => {
    onOpacityChange(values[0]);
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={selected} onValueChange={onSelect}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {animations.map((animation) => (
            <div key={animation.id}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={animation.id} id={`animation-${animation.id}`} />
                      <div className="flex items-center gap-2">
                        {animation.icon}
                        <Label htmlFor={`animation-${animation.id}`}>{animation.name}</Label>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(animation.id)}
                      className="text-xs"
                    >
                      Просмотр
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </RadioGroup>
      
      {selected !== 'none' && (
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="animation-opacity">Прозрачность анимации</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <Slider
            id="animation-opacity"
            min={0.1}
            max={1.0}
            step={0.05}
            value={[opacity]}
            onValueChange={handleOpacityChange}
            className="mt-2"
          />
        </div>
      )}
      
      {/* Предпросмотр выбранной анимации */}
      {previewType && previewType !== 'none' && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <WebGLAnimation type={previewType as any} opacity={opacity} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                variant="secondary" 
                onClick={() => setPreviewType(null)}
                className="z-10"
              >
                Закрыть предпросмотр
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
