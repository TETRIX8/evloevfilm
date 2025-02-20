
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Ошибка при проверке аутентификации:", error);
          toast.error("Ошибка при проверке аутентификации");
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Ошибка:", error);
        toast.error("Произошла ошибка при проверке авторизации");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Protected route auth event:", event, session);
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error("Для доступа к этому разделу необходимо войти в систему");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
