import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Movie from "./pages/Movie";
import Saved from "./pages/Saved";
import New from "./pages/New";
import { PageTransition } from "./components/PageTransition";
import { LoadingScreen } from "./components/LoadingScreen";
import { OnboardingTour } from "./components/OnboardingTour";
import { getDeviceInfo } from "./utils/deviceDetection";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          } 
        />
        <Route 
          path="/movie/:title" 
          element={
            <PageTransition>
              <Movie />
            </PageTransition>
          } 
        />
        <Route 
          path="/saved" 
          element={
            <PageTransition>
              <Saved />
            </PageTransition>
          } 
        />
        <Route 
          path="/new" 
          element={
            <PageTransition>
              <New />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Save device info on first visit
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      const deviceInfo = getDeviceInfo();
      localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
      localStorage.setItem("hasVisited", "true");
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AnimatePresence mode="wait">
            {isLoading && <LoadingScreen />}
          </AnimatePresence>
          <BrowserRouter>
            <AnimatedRoutes />
            <OnboardingTour />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;