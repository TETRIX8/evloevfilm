
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Upload, Trash2 } from "lucide-react";
import { soundEffects } from "@/utils/soundEffects";

interface BackgroundUploaderProps {
  currentBackground: string;
  onBackgroundChange: (url: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

// Default background path
const DEFAULT_BACKGROUND = "/lovable-uploads/9d409ff7-8423-4652-b78a-ebaa9431b5ca.png";

export function BackgroundUploader({ 
  currentBackground, 
  onBackgroundChange, 
  opacity, 
  onOpacityChange 
}: BackgroundUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Effect to initialize with default background if no background is set
  useEffect(() => {
    const savedBackground = localStorage.getItem("customBackground");
    if (!savedBackground && !currentBackground) {
      onBackgroundChange(DEFAULT_BACKGROUND);
    }
  }, [currentBackground, onBackgroundChange]);
  
  // Effect to save the background image to localStorage
  useEffect(() => {
    if (currentBackground) {
      localStorage.setItem("customBackground", currentBackground);
    }
  }, [currentBackground]);
  
  // Effect to save the opacity value to localStorage
  useEffect(() => {
    localStorage.setItem("bgOpacity", opacity.toString());
  }, [opacity]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          onBackgroundChange(e.target.result);
          soundEffects.play("save");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBackground = () => {
    onBackgroundChange(DEFAULT_BACKGROUND);
    localStorage.setItem("customBackground", DEFAULT_BACKGROUND);
    soundEffects.play("click");
  };

  const resetToDefault = () => {
    onBackgroundChange(DEFAULT_BACKGROUND);
    localStorage.setItem("customBackground", DEFAULT_BACKGROUND);
    soundEffects.play("click");
  };

  const handleOpacityChange = (value: number[]) => {
    onOpacityChange(value[0]);
  };

  return (
    <div className="space-y-4">
      {currentBackground ? (
        <div className="relative">
          <img 
            src={currentBackground} 
            alt="Custom background" 
            className="w-full h-40 object-cover rounded-md"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {currentBackground !== DEFAULT_BACKGROUND && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={clearBackground}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {currentBackground !== DEFAULT_BACKGROUND && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={resetToDefault}
              >
                Вернуть стандартный
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Перетащите изображение сюда или нажмите для выбора
            </p>
            <Button 
              variant="outline" 
              onClick={() => inputRef.current?.click()}
            >
              Выбрать файл
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      )}

      {currentBackground && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="bg-opacity">Прозрачность фона</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <Slider
            id="bg-opacity"
            min={0.1}
            max={1.0}
            step={0.05}
            value={[opacity]}
            onValueChange={handleOpacityChange}
          />
        </div>
      )}
    </div>
  );
}
