import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Movie from "./pages/Movie";
import Saved from "./pages/Saved";
import New from "./pages/New";
import { PageTransition } from "./components/PageTransition";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;