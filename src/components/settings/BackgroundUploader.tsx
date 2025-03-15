
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Film, Image } from "lucide-react";
import { soundEffects } from "@/utils/soundEffects";
import { getDBSetting, setDBSetting, deleteDBSetting } from "@/utils/indexedDB";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BackgroundUploaderProps {
  currentBackground: string;
  onBackgroundChange: (url: string, type?: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

export function BackgroundUploader({ 
  currentBackground, 
  onBackgroundChange, 
  opacity, 
  onOpacityChange 
}: BackgroundUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [backgroundType, setBackgroundType] = useState<string>("image");
  const [activeTab, setActiveTab] = useState<string>("image");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Effect to load saved background from IndexedDB on component mount
  useEffect(() => {
    const loadSavedBackground = async () => {
      try {
        const savedBackground = await getDBSetting<string>("customBackground");
        const savedBackgroundType = await getDBSetting<string>("backgroundType");
        const savedOpacity = await getDBSetting<number>("bgOpacity");
        
        if (savedBackground) {
          onBackgroundChange(savedBackground, savedBackgroundType || "image");
          setBackgroundType(savedBackgroundType || "image");
          setActiveTab(savedBackgroundType || "image");
        }
        
        if (savedOpacity !== null) {
          onOpacityChange(savedOpacity);
        }
      } catch (error) {
        console.error("Failed to load background from IndexedDB:", error);
      }
    };
    
    loadSavedBackground();
  }, [onBackgroundChange, onOpacityChange]);
  
  // Effect to save the background to IndexedDB
  useEffect(() => {
    if (currentBackground) {
      setDBSetting("customBackground", currentBackground);
      setDBSetting("backgroundType", backgroundType);
    }
  }, [currentBackground, backgroundType]);
  
  // Effect to save the opacity value to IndexedDB
  useEffect(() => {
    setDBSetting("bgOpacity", opacity);
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
      const file = e.dataTransfer.files[0];
      const fileType = file.type.split('/')[0]; // 'image' or 'video'
      
      if (fileType === 'image' || fileType === 'video') {
        setBackgroundType(fileType);
        setActiveTab(fileType);
        handleFile(file, fileType);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], type);
    }
  };

  const handleFile = (file: File, type: string) => {
    const isImage = type === 'image';
    const isVideo = type === 'video';
    
    if ((isImage && file.type.startsWith("image/")) || 
        (isVideo && file.type.startsWith("video/"))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          onBackgroundChange(e.target.result, type);
          setBackgroundType(type);
          soundEffects.play("save");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBackground = () => {
    onBackgroundChange("", "");
    setBackgroundType("");
    deleteDBSetting("customBackground");
    deleteDBSetting("backgroundType");
    soundEffects.play("click");
  };

  const handleOpacityChange = (value: number[]) => {
    onOpacityChange(value[0]);
  };

  const renderMediaPreview = () => {
    if (!currentBackground) return null;
    
    return (
      <div className="relative">
        {backgroundType === "image" ? (
          <img 
            src={currentBackground} 
            alt="Custom background" 
            className="w-full h-40 object-cover rounded-md"
          />
        ) : backgroundType === "video" ? (
          <video 
            src={currentBackground}
            className="w-full h-40 object-cover rounded-md"
            autoPlay
            muted
            loop
          />
        ) : null}
        <Button 
          variant="destructive" 
          size="sm"
          className="absolute top-2 right-2"
          onClick={clearBackground}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderUploader = () => {
    return (
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              <span>Изображение</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-1">
              <Film className="h-4 w-4" />
              <span>Видео</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="mt-0">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Перетащите изображение или GIF сюда или нажмите для выбора
              </p>
              <Button 
                variant="outline" 
                onClick={() => imageInputRef.current?.click()}
              >
                Выбрать изображение
              </Button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleChange(e, "image")}
            />
          </TabsContent>
          
          <TabsContent value="video" className="mt-0">
            <div className="flex flex-col items-center gap-2">
              <Film className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Перетащите видео сюда или нажмите для выбора
              </p>
              <Button 
                variant="outline" 
                onClick={() => videoInputRef.current?.click()}
              >
                Выбрать видео
              </Button>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              className="hidden"
              accept="video/*"
              onChange={(e) => handleChange(e, "video")}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {currentBackground ? renderMediaPreview() : renderUploader()}

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
