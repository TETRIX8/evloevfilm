
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Palette, Sliders, Volume2, VolumeX, Eye, Save, X, Loader, Sparkles } from "lucide-react";
import { BackgroundUploader } from "@/components/settings/BackgroundUploader";
import { ColorThemeSelector } from "@/components/settings/ColorThemeSelector";
import { LoadingAnimationSelector } from "@/components/settings/LoadingAnimationSelector";
import { WebGLAnimationSelector } from "@/components/settings/WebGLAnimationSelector";
import { toast } from "sonner";
import { soundEffects } from "@/utils/soundEffects";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
  // Original state settings
  const [soundEnabled, setSoundEnabled] = useState(() => !soundEffects.isSoundMuted());
  const [customBackground, setCustomBackground] = useState(() => {
    return localStorage.getItem("customBackground") || "";
  });
  const [bgOpacity, setBgOpacity] = useState(() => {
    return parseFloat(localStorage.getItem("bgOpacity") || "0.5");
  });
  const [selectedColorTheme, setSelectedColorTheme] = useState(() => {
    return localStorage.getItem("colorTheme") || "default";
  });
  
  // New state settings
  const [selectedLoadingAnimation, setSelectedLoadingAnimation] = useState(() => {
    return localStorage.getItem("loadingAnimation") || "default";
  });
  const [simplifiedMode, setSimplifiedMode] = useState(() => {
    return localStorage.getItem("simplifiedMode") === "true";
  });
  
  // WebGL анимации
  const [webglAnimation, setWebglAnimation] = useState(() => {
    return localStorage.getItem("webglAnimation") || "none";
  });
  const [webglOpacity, setWebglOpacity] = useState(() => {
    return parseFloat(localStorage.getItem("webglOpacity") || "0.7");
  });
  
  // Add state to track changes for save/cancel functionality
  const [originalSettings, setOriginalSettings] = useState({
    soundEnabled: soundEnabled,
    customBackground: customBackground,
    bgOpacity: bgOpacity,
    selectedColorTheme: selectedColorTheme,
    selectedLoadingAnimation: selectedLoadingAnimation,
    simplifiedMode: simplifiedMode,
    theme: theme,
    webglAnimation: webglAnimation,
    webglOpacity: webglOpacity
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Track changes
  useEffect(() => {
    const currentSettings = {
      soundEnabled,
      customBackground,
      bgOpacity,
      selectedColorTheme,
      selectedLoadingAnimation,
      simplifiedMode,
      theme,
      webglAnimation,
      webglOpacity
    };
    
    const settingsChanged = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
    setHasChanges(settingsChanged);
  }, [
    soundEnabled, 
    customBackground, 
    bgOpacity, 
    selectedColorTheme, 
    selectedLoadingAnimation, 
    simplifiedMode, 
    theme, 
    originalSettings,
    webglAnimation,
    webglOpacity
  ]);

  // Apply background and opacity effect
  useEffect(() => {
    const rootEl = document.documentElement;
    
    if (customBackground) {
      rootEl.style.setProperty('--custom-bg-image', `url(${customBackground})`);
      rootEl.style.setProperty('--custom-bg-opacity', bgOpacity.toString());
      rootEl.classList.add('has-custom-background');
    } else {
      rootEl.classList.remove('has-custom-background');
      rootEl.style.removeProperty('--custom-bg-image');
    }
  }, [customBackground, bgOpacity]);
  
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
  
  // Handle WebGL animation selection
  const handleWebGLAnimationChange = (animation: string) => {
    setWebglAnimation(animation);
  };
  
  // Handle WebGL opacity change
  const handleWebGLOpacityChange = (opacity: number) => {
    setWebglOpacity(opacity);
  };
  
  // Handle simplified mode toggle
  const toggleSimplifiedMode = () => {
    setSimplifiedMode(!simplifiedMode);
  };

  // Save all settings
  const saveSettings = () => {
    setIsLoading(true);
    
    try {
      // Save all settings to localStorage
      localStorage.setItem("customBackground", customBackground);
      localStorage.setItem("bgOpacity", bgOpacity.toString());
      localStorage.setItem("colorTheme", selectedColorTheme);
      localStorage.setItem("loadingAnimation", selectedLoadingAnimation);
      localStorage.setItem("simplifiedMode", simplifiedMode.toString());
      localStorage.setItem("webglAnimation", webglAnimation);
      localStorage.setItem("webglOpacity", webglOpacity.toString());
      
      // Update original settings to match current
      setOriginalSettings({
        soundEnabled,
        customBackground,
        bgOpacity,
        selectedColorTheme,
        selectedLoadingAnimation,
        simplifiedMode,
        theme,
        webglAnimation,
        webglOpacity
      });
      
      toast.success("Настройки успешно сохранены");
      setHasChanges(false);
      
      // Перезагрузка страницы для применения изменений WebGL анимаций
      if (originalSettings.webglAnimation !== webglAnimation || 
          originalSettings.webglOpacity !== webglOpacity) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
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
      setBgOpacity(originalSettings.bgOpacity);
      setSelectedColorTheme(originalSettings.selectedColorTheme);
      setSelectedLoadingAnimation(originalSettings.selectedLoadingAnimation);
      setSimplifiedMode(originalSettings.simplifiedMode);
      setTheme(originalSettings.theme);
      setWebglAnimation(originalSettings.webglAnimation);
      setWebglOpacity(originalSettings.webglOpacity);
      
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
      setBgOpacity(0.5);
      setSoundEnabled(true);
      setSelectedColorTheme("default");
      setSelectedLoadingAnimation("default");
      setSimplifiedMode(false);
      setTheme("dark");
      setWebglAnimation("none");
      setWebglOpacity(0.7);
      
      // Apply reset settings
      document.documentElement.setAttribute("data-color-theme", "default");
      document.documentElement.removeAttribute("data-simplified-mode");
      
      // If sound is muted, unmute it
      if (soundEffects.isSoundMuted()) {
        soundEffects.toggleMute();
      }
      
      // Clear localStorage settings
      localStorage.removeItem("customBackground");
      localStorage.removeItem("bgOpacity");
      localStorage.removeItem("colorTheme");
      localStorage.removeItem("loadingAnimation");
      localStorage.removeItem("simplifiedMode");
      localStorage.removeItem("webglAnimation");
      localStorage.removeItem("webglOpacity");
      
      toast.success("Настройки сброшены");
      
      // Update original settings to match reset defaults
      setOriginalSettings({
        soundEnabled: true,
        customBackground: "",
        bgOpacity: 0.5,
        selectedColorTheme: "default",
        selectedLoadingAnimation: "default",
        simplifiedMode: false,
        theme: "dark",
        webglAnimation: "none",
        webglOpacity: 0.7
      });
      
      setHasChanges(false);
      
      soundEffects.play("click");
      
      // Перезагрузим страницу через 1 секунду для применения изменений
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
            <TabsTrigger value="webgl" className="whitespace-nowrap">WebGL эффекты</TabsTrigger>
            <TabsTrigger value="accessibility" className="whitespace-nowrap">Доступность</TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Фон</CardTitle>
              <CardDescription>
                Загрузите собственное изображение для фона сайта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <BackgroundUploader 
                currentBackground={customBackground} 
                onBackgroundChange={setCustomBackground} 
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
        
        <TabsContent value="webgl" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>WebGL эффекты</CardTitle>
              <CardDescription>
                Выберите эффекты WebGL для фона приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <WebGLAnimationSelector
                selected={webglAnimation}
                opacity={webglOpacity}
                onSelect={handleWebGLAnimationChange}
                onOpacityChange={handleWebGLOpacityChange}
              />
              <p className="text-sm text-muted-foreground mt-4">
                Настройки вступят в силу после сохранения и перезагрузки страницы.
              </p>
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
