import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Palette, Sliders, Volume2, VolumeX, Eye, Save, X, Loader } from "lucide-react";
import { BackgroundUploader } from "@/components/settings/BackgroundUploader";
import { ColorThemeSelector } from "@/components/settings/ColorThemeSelector";
import { LoadingAnimationSelector } from "@/components/settings/LoadingAnimationSelector";
import { toast } from "sonner";
import { soundEffects } from "@/utils/soundEffects";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDBSetting, setDBSetting, deleteDBSetting } from "@/utils/indexedDB";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
  // Original state settings
  const [soundEnabled, setSoundEnabled] = useState(() => !soundEffects.isSoundMuted());
  const [customBackground, setCustomBackground] = useState("");
  const [backgroundType, setBackgroundType] = useState("image");
  const [bgOpacity, setBgOpacity] = useState(0.5);
  const [selectedColorTheme, setSelectedColorTheme] = useState("default");
  
  // New state settings
  const [selectedLoadingAnimation, setSelectedLoadingAnimation] = useState("default");
  const [simplifiedMode, setSimplifiedMode] = useState(false);
  
  // Load settings from IndexedDB on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load background and opacity
        const savedBackground = await getDBSetting<string>("customBackground");
        const savedBackgroundType = await getDBSetting<string>("backgroundType");
        const savedOpacity = await getDBSetting<number>("bgOpacity");
        
        if (savedBackground) {
          setCustomBackground(savedBackground);
          setBackgroundType(savedBackgroundType || "image");
        }
        
        if (savedOpacity !== null) {
          setBgOpacity(savedOpacity);
        }
        
        // Load color theme
        const savedColorTheme = await getDBSetting<string>("colorTheme");
        if (savedColorTheme) {
          setSelectedColorTheme(savedColorTheme);
        }
        
        // Load loading animation
        const savedLoadingAnimation = await getDBSetting<string>("loadingAnimation");
        if (savedLoadingAnimation) {
          setSelectedLoadingAnimation(savedLoadingAnimation);
        }
        
        // Load simplified mode
        const savedSimplifiedMode = await getDBSetting<boolean>("simplifiedMode");
        if (savedSimplifiedMode !== null) {
          setSimplifiedMode(savedSimplifiedMode);
        }
      } catch (error) {
        console.error("Failed to load settings from IndexedDB:", error);
      }
      
      // Set original settings after loading
      setOriginalSettings({
        soundEnabled,
        customBackground,
        backgroundType,
        bgOpacity,
        selectedColorTheme,
        selectedLoadingAnimation,
        simplifiedMode,
        theme
      });
    };
    
    loadSettings();
  }, []);
  
  // Add state to track changes for save/cancel functionality
  const [originalSettings, setOriginalSettings] = useState({
    soundEnabled: soundEnabled,
    customBackground: customBackground,
    backgroundType: backgroundType,
    bgOpacity: bgOpacity,
    selectedColorTheme: selectedColorTheme,
    selectedLoadingAnimation: selectedLoadingAnimation,
    simplifiedMode: simplifiedMode,
    theme: theme
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Track changes
  useEffect(() => {
    const currentSettings = {
      soundEnabled,
      customBackground,
      backgroundType,
      bgOpacity,
      selectedColorTheme,
      selectedLoadingAnimation,
      simplifiedMode,
      theme
    };
    
    const settingsChanged = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
    setHasChanges(settingsChanged);
  }, [
    soundEnabled, 
    customBackground, 
    backgroundType,
    bgOpacity, 
    selectedColorTheme, 
    selectedLoadingAnimation, 
    simplifiedMode, 
    theme, 
    originalSettings
  ]);

  // Apply background and opacity effect
  useEffect(() => {
    const rootEl = document.documentElement;
    
    if (customBackground) {
      if (backgroundType === "image") {
        rootEl.style.setProperty('--custom-bg-image', `url(${customBackground})`);
        rootEl.style.setProperty('--custom-bg-video', 'none');
        rootEl.classList.add('has-custom-background');
        rootEl.classList.remove('has-video-background');
      } else if (backgroundType === "video") {
        // For videos, we need to create a video element in the background
        let videoEl = document.getElementById('bg-video') as HTMLVideoElement;
        if (!videoEl) {
          videoEl = document.createElement('video');
          videoEl.id = 'bg-video';
          videoEl.autoplay = true;
          videoEl.loop = true;
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.className = 'fixed top-0 left-0 w-full h-full object-cover z-[-1]';
          document.body.appendChild(videoEl);
        }
        
        videoEl.src = customBackground;
        videoEl.style.opacity = bgOpacity.toString();
        
        rootEl.classList.add('has-video-background');
        rootEl.classList.remove('has-custom-background');
      }
      
      rootEl.style.setProperty('--custom-bg-opacity', bgOpacity.toString());
    } else {
      rootEl.classList.remove('has-custom-background', 'has-video-background');
      rootEl.style.removeProperty('--custom-bg-image');
      
      // Remove video element if exists
      const videoEl = document.getElementById('bg-video');
      if (videoEl) {
        videoEl.remove();
      }
    }
  }, [customBackground, backgroundType, bgOpacity]);
  
  // Apply simplified mode
  useEffect(() => {
    const rootEl = document.documentElement;
    
    if (simplifiedMode) {
      rootEl.setAttribute("data-simplified-mode", "true");
    } else {
      rootEl.removeAttribute("data-simplified-mode");
    }
  }, [simplifiedMode]);

  // Handle sound toggle
  const toggleSound = () => {
    const newState = soundEffects.toggleMute();
    setSoundEnabled(!newState);
  };

  // Handle color theme selection
  const handleColorThemeChange = (theme: string) => {
    setSelectedColorTheme(theme);
    document.documentElement.setAttribute("data-color-theme", theme);
  };
  
  // Handle loading animation selection
  const handleLoadingAnimationChange = (animation: string) => {
    setSelectedLoadingAnimation(animation);
  };
  
  // Handle simplified mode toggle
  const toggleSimplifiedMode = () => {
    setSimplifiedMode(!simplifiedMode);
  };
  
  // Handle background change with type
  const handleBackgroundChange = (url: string, type?: string) => {
    setCustomBackground(url);
    if (type) {
      setBackgroundType(type);
    }
  };

  // Save all settings
  const saveSettings = () => {
    setIsLoading(true);
    
    try {
      // Save all settings to IndexedDB
      if (customBackground) {
        setDBSetting("customBackground", customBackground);
        setDBSetting("backgroundType", backgroundType);
      } else {
        deleteDBSetting("customBackground");
        deleteDBSetting("backgroundType");
      }
      
      setDBSetting("bgOpacity", bgOpacity);
      setDBSetting("colorTheme", selectedColorTheme);
      setDBSetting("loadingAnimation", selectedLoadingAnimation);
      setDBSetting("simplifiedMode", simplifiedMode);
      
      // Update original settings to match current
      setOriginalSettings({
        soundEnabled,
        customBackground,
        backgroundType,
        bgOpacity,
        selectedColorTheme,
        selectedLoadingAnimation,
        simplifiedMode,
        theme
      });
      
      toast.success("Настройки успешно сохранены");
      setHasChanges(false);
      
      soundEffects.play("click");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Не удалось сохранить настройки");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel changes and revert to original settings
  const cancelChanges = () => {
    setIsLoading(true);
    
    try {
      setSoundEnabled(originalSettings.soundEnabled);
      setCustomBackground(originalSettings.customBackground);
      setBackgroundType(originalSettings.backgroundType);
      setBgOpacity(originalSettings.bgOpacity);
      setSelectedColorTheme(originalSettings.selectedColorTheme);
      setSelectedLoadingAnimation(originalSettings.selectedLoadingAnimation);
      setSimplifiedMode(originalSettings.simplifiedMode);
      setTheme(originalSettings.theme);
      
      // Apply original settings
      document.documentElement.setAttribute("data-color-theme", originalSettings.selectedColorTheme);
      
      if (originalSettings.soundEnabled) {
        soundEffects.toggleMute();
      }
      
      toast.info("Изменения отменены");
      setHasChanges(false);
      
      soundEffects.play("click");
    } catch (error) {
      console.error("Error canceling changes:", error);
      toast.error("Не удалось отменить изменения");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all settings
  const resetSettings = () => {
    setIsLoading(true);
    
    try {
      setCustomBackground("");
      setBackgroundType("image");
      setBgOpacity(0.5);
      setSoundEnabled(true);
      setSelectedColorTheme("default");
      setSelectedLoadingAnimation("default");
      setSimplifiedMode(false);
      setTheme("dark");
      
      // Apply reset settings
      document.documentElement.setAttribute("data-color-theme", "default");
      document.documentElement.removeAttribute("data-simplified-mode");
      
      // If sound is muted, unmute it
      if (soundEffects.isSoundMuted()) {
        soundEffects.toggleMute();
      }
      
      // Clear IndexedDB settings
      deleteDBSetting("customBackground");
      deleteDBSetting("backgroundType");
      deleteDBSetting("bgOpacity");
      deleteDBSetting("colorTheme");
      deleteDBSetting("loadingAnimation");
      deleteDBSetting("simplifiedMode");
      
      // Remove video element if exists
      const videoEl = document.getElementById('bg-video');
      if (videoEl) {
        videoEl.remove();
      }
      
      toast.success("Настройки сброшены");
      
      // Update original settings to match reset defaults
      setOriginalSettings({
        soundEnabled: true,
        customBackground: "",
        backgroundType: "image",
        bgOpacity: 0.5,
        selectedColorTheme: "default",
        selectedLoadingAnimation: "default",
        simplifiedMode: false,
        theme: "dark"
      });
      
      setHasChanges(false);
      
      soundEffects.play("click");
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Не удалось сбросить настройки");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-4 md:py-10 mt-8 md:mt-16 px-3 md:px-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Настройки</h1>
        <div className="flex items-center gap-1 md:gap-2">
          {hasChanges && (
            <>
              <Button 
                variant="outline" 
                onClick={cancelChanges}
                disabled={isLoading}
                className="gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm"
              >
                {isLoading ? <Loader className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <X className="h-3 w-3 md:h-4 md:w-4" />}
                <span className="hidden md:inline">Отменить</span>
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={isLoading}
                className="gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm"
              >
                {isLoading ? <Loader className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3 w-3 md:h-4 md:w-4" />}
                <span className="hidden md:inline">Сохранить</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="appearance" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="mb-4 w-auto flex overflow-auto">
            <TabsTrigger value="appearance" className="whitespace-nowrap">Внешний вид</TabsTrigger>
            <TabsTrigger value="sound" className="whitespace-nowrap">Звуки</TabsTrigger>
            <TabsTrigger value="theme" className="whitespace-nowrap">Цветовая схема</TabsTrigger>
            <TabsTrigger value="animations" className="whitespace-nowrap">Анимации</TabsTrigger>
            <TabsTrigger value="accessibility" className="whitespace-nowrap">Доступность</TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Фон</CardTitle>
              <CardDescription>
                Загрузите собственное изображение, гифку или видео для фона сайта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <BackgroundUploader 
                currentBackground={customBackground} 
                onBackgroundChange={handleBackgroundChange} 
                opacity={bgOpacity}
                onOpacityChange={setBgOpacity}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sound" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Настройки звука</CardTitle>
              <CardDescription>
                Управление звуковыми эффектами интерфейса
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  <Label htmlFor="sound-effects">Звуковые эффекты</Label>
                </div>
                <Switch 
                  id="sound-effects" 
                  checked={soundEnabled} 
                  onCheckedChange={toggleSound}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Цветовая схема</CardTitle>
              <CardDescription>
                Выберите цветовую схему для интерфейса
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <Label>Темный/светлый режим</Label>
                <div className="flex items-center gap-2 md:gap-4">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    onClick={() => setTheme("light")}
                    size={isMobile ? "sm" : "default"}
                    className="flex-1"
                  >
                    Светлый
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    onClick={() => setTheme("dark")}
                    size={isMobile ? "sm" : "default"}
                    className="flex-1"
                  >
                    Темный
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Label className="mb-3 block">Цветовые варианты</Label>
              <ScrollArea className="h-64 md:h-80">
                <ColorThemeSelector 
                  selected={selectedColorTheme}
                  onSelect={handleColorThemeChange}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="animations" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Анимации загрузки</CardTitle>
              <CardDescription>
                Выберите анимацию для экрана загрузки
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <LoadingAnimationSelector
                selected={selectedLoadingAnimation}
                onSelect={handleLoadingAnimationChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Доступность</CardTitle>
              <CardDescription>
                Настройки для удобства использования
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <Label htmlFor="simplified-mode">Упрощенный режим для слабовидящих</Label>
                </div>
                <Switch 
                  id="simplified-mode" 
                  checked={simplifiedMode} 
                  onCheckedChange={toggleSimplifiedMode}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Упрощенный режим делает интерфейс более контрастным, убирает лишние анимации и увеличивает размер текста.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 md:mt-8 flex justify-end">
        <Button variant="outline" onClick={resetSettings} disabled={isLoading}>
          {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
          Сбросить настройки
        </Button>
      </div>
    </div>
  );
}
