
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Palette, Sliders, Volume2, VolumeX } from "lucide-react";
import { BackgroundUploader } from "@/components/settings/BackgroundUploader";
import { ColorThemeSelector } from "@/components/settings/ColorThemeSelector";
import { soundEffects } from "@/utils/soundEffects";

export default function Settings() {
  const { theme, setTheme } = useTheme();
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
    
    localStorage.setItem("customBackground", customBackground);
    localStorage.setItem("bgOpacity", bgOpacity.toString());
  }, [customBackground, bgOpacity]);

  // Handle sound toggle
  const toggleSound = () => {
    const newState = soundEffects.toggleMute();
    setSoundEnabled(!newState);
  };

  // Handle color theme selection
  const handleColorThemeChange = (theme: string) => {
    setSelectedColorTheme(theme);
    localStorage.setItem("colorTheme", theme);
    
    // Apply theme to the document
    document.documentElement.setAttribute("data-color-theme", theme);
  };

  // Reset all settings
  const resetSettings = () => {
    setCustomBackground("");
    setBgOpacity(0.5);
    setSoundEnabled(true);
    soundEffects.toggleMute();
    handleColorThemeChange("default");
    setTheme("dark");
    
    localStorage.removeItem("customBackground");
    localStorage.removeItem("bgOpacity");
    localStorage.removeItem("colorTheme");
  };

  return (
    <div className="container max-w-4xl py-10 mt-16">
      <h1 className="text-3xl font-bold mb-6">Настройки</h1>
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          <TabsTrigger value="sound">Звуки</TabsTrigger>
          <TabsTrigger value="theme">Цветовая схема</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Фон</CardTitle>
              <CardDescription>
                Загрузите собственное изображение для фона сайта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            <CardHeader>
              <CardTitle>Настройки звука</CardTitle>
              <CardDescription>
                Управление звуковыми эффектами интерфейса
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            <CardHeader>
              <CardTitle>Цветовая схема</CardTitle>
              <CardDescription>
                Выберите цветовую схему для интерфейса
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <Label>Темный/светлый режим</Label>
                <div className="flex items-center gap-4">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    onClick={() => setTheme("light")}
                    size="sm"
                  >
                    Светлый
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    onClick={() => setTheme("dark")}
                    size="sm"
                  >
                    Темный
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Label className="mb-3 block">Цветовые варианты</Label>
              <ScrollArea className="h-80">
                <ColorThemeSelector 
                  selected={selectedColorTheme}
                  onSelect={handleColorThemeChange}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button variant="outline" onClick={resetSettings}>
          Сбросить настройки
        </Button>
      </div>
    </div>
  );
}
