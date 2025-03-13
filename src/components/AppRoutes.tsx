
import { Routes, Route } from "react-router-dom";
import { PageTransition } from "./PageTransition";
import { ProtectedRoute } from "./ProtectedRoute";
import Index from "@/pages/Index";
import Movie from "@/pages/Movie";
import Saved from "@/pages/Saved";
import New from "@/pages/New";
import History from "@/pages/History";
import Auth from "@/pages/Auth";
import About from "@/pages/About";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";

export function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <PageTransition>
            <Auth />
          </PageTransition>
        } 
      />
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
      <Route 
        path="/history" 
        element={
          <PageTransition>
            <History />
          </PageTransition>
        } 
      />
      <Route 
        path="/about" 
        element={
          <PageTransition>
            <About />
          </PageTransition>
        }
      />
      <Route 
        path="/support" 
        element={
          <PageTransition>
            <Support />
          </PageTransition>
        }
      />
      <Route 
        path="/profile" 
        element={
          <PageTransition>
            <Profile />
          </PageTransition>
        }
      />
      <Route 
        path="/admin" 
        element={
          <PageTransition>
            <Admin />
          </PageTransition>
        }
      />
      <Route 
        path="/chat" 
        element={
          <PageTransition>
            <Chat />
          </PageTransition>
        }
      />
      <Route 
        path="/settings" 
        element={
          <PageTransition>
            <Settings />
          </PageTransition>
        }
      />
    </Routes>
  );
}
