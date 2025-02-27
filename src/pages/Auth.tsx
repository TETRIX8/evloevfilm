
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { soundEffects } from "@/utils/soundEffects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setIsAuthenticated(!!data.session);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      // Use type guard to check for specific event types
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || event === "MFA_CHALLENGE_VERIFIED") {
        setIsAuthenticated(true);
        soundEffects.play("success");
        
        if (event === "SIGNED_IN") {
          toast.success("Вы успешно вошли в систему!");
          navigate("/profile");
        }
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setIsAuthenticated(false);
        
        if (event === "SIGNED_OUT") {
          toast.info("Вы вышли из системы");
        }
      } else if (event === "PASSWORD_RECOVERY") {
        toast.info("Проверьте вашу почту для восстановления пароля");
      } else if (event === "ERROR") {
        toast.error("Произошла ошибка во время аутентификации");
      }
    });

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleBack = () => {
    soundEffects.play("click");
    navigate(-1);
  };

  const handleSignOut = async () => {
    try {
      soundEffects.play("click");
      await supabase.auth.signOut();
      
      // Auth listener will handle the redirect and toast
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Ошибка при выходе из системы");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 flex flex-col items-center">
      <div className="max-w-md w-full space-y-8 bg-card rounded-xl shadow-lg p-6 sm:p-8">
        {isAuthenticated ? (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Вы уже авторизованы</h2>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/profile")} 
                className="w-full"
                size="lg"
              >
                Перейти в профиль
              </Button>
              <Button 
                onClick={handleSignOut} 
                variant="destructive"
                className="w-full"
                size="lg"
              >
                Выйти из аккаунта
              </Button>
              <Button 
                onClick={handleBack} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Вернуться назад
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Вход / Регистрация</h2>
              <p className="text-muted-foreground mt-2">
                Войдите в свой аккаунт или создайте новый
              </p>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="signin">Вход</TabsTrigger>
                <TabsTrigger value="signup">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <SupabaseAuth
                  supabaseClient={supabase}
                  appearance={{ 
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(var(--primary))',
                          brandAccent: 'hsl(var(--primary))',
                        },
                      },
                    },
                  }}
                  theme="dark"
                  providers={["google"]}
                  redirectTo={`${window.location.origin}/profile`}
                  showLinks={true}
                  view="sign_in"
                />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <SupabaseAuth
                  supabaseClient={supabase}
                  appearance={{ 
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(var(--primary))',
                          brandAccent: 'hsl(var(--primary))',
                        },
                      },
                    },
                  }}
                  theme="dark"
                  providers={["google"]}
                  redirectTo={`${window.location.origin}/profile`}
                  showLinks={true}
                  view="sign_up"
                />
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <Button 
                onClick={handleBack} 
                variant="outline"
                className="w-full"
              >
                Вернуться назад
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
