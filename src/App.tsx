import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Movie from "./pages/Movie";
import Saved from "./pages/Saved";
import New from "./pages/New";
import History from "./pages/History";
import Auth from "./pages/Auth";
import { PageTransition } from "./components/PageTransition";
import { LoadingScreen } from "./components/LoadingScreen";
import { OnboardingTour } from "./components/OnboardingTour";
import { getDeviceInfo } from "./utils/deviceDetection";
import { requestNotificationPermission, scheduleNotification } from "./utils/notifications";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // If auth state is not yet determined, don't render routes
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <PageTransition>
              <Auth />
            </PageTransition>
          )
        } 
      />
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <Navigate to="/auth" replace />
          ) : (
            <PageTransition>
              <Index />
            </PageTransition>
          )
        } 
      />
      <Route 
        path="/movie/:title" 
        element={
          !isAuthenticated ? (
            <Navigate to="/auth" replace />
          ) : (
            <PageTransition>
              <Movie />
            </PageTransition>
          )
        } 
      />
      <Route 
        path="/saved" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Saved />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/new" 
        element={
          !isAuthenticated ? (
            <Navigate to="/auth" replace />
          ) : (
            <PageTransition>
              <New />
            </PageTransition>
          )
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <History />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Save device info on first visit
      const hasVisited = localStorage.getItem("hasVisited");
      if (!hasVisited) {
        const deviceInfo = getDeviceInfo();
        localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
        localStorage.setItem("hasVisited", "true");
        
        // Request notification permission on first visit
        const permissionGranted = await requestNotificationPermission();
        if (permissionGranted) {
          toast.success("Уведомления включены! Мы будем держать вас в курсе новинок.");
          scheduleNotification();
        }
      } else if (localStorage.getItem("notificationPermission") === "granted") {
        scheduleNotification();
      }

      // Simulate initial loading for 2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialized(true);
      }, 2000);

      return () => clearTimeout(timer);
    };

    initializeApp();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      {isInitialized && (
        <BrowserRouter>
          <AnimatedRoutes />
          <OnboardingTour />
        </BrowserRouter>
      )}
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