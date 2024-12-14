import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Movie from "./pages/Movie";
import Saved from "./pages/Saved";
import New from "./pages/New";
import { PageTransition } from "./components/PageTransition";
import { LoadingScreen } from "./components/LoadingScreen";
import { OnboardingTour } from "./components/OnboardingTour";
import { getDeviceInfo } from "./utils/deviceDetection";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  return (
    <Routes>
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
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Save device info on first visit
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      const deviceInfo = getDeviceInfo();
      localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
      localStorage.setItem("hasVisited", "true");
    }

    // Simulate initial loading for 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      <BrowserRouter>
        <AnimatedRoutes />
        <OnboardingTour />
      </BrowserRouter>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;