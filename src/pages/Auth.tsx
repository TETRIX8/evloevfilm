
import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation/Navigation";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { EmailCodeAuth } from "@/components/EmailCodeAuth";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

export default function Auth() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<"sign_in" | "sign_up" | "email_register" | "password_reset">("sign_in");
  const [authMethod, setAuthMethod] = useState<"supabase" | "firebase">("firebase");
  const [firebaseMode, setFirebaseMode] = useState<"signin" | "signup">("signin");
  
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      if (authMethod === "supabase") {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate("/");
        }
      } else if (firebaseUser) {
        navigate("/");
      }
    };
    checkUser();
    
    // Set up auth state change listener for Supabase
    if (authMethod === "supabase") {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_IN" && session) {
            navigate("/");
            toast.success("Успешный вход в систему!");
          } else if (event === "SIGNED_OUT") {
            navigate("/auth");
            toast.info("Вы вышли из системы");
          } else if (event === "PASSWORD_RECOVERY") {
            toast.info("Проверьте вашу электронную почту для сброса пароля");
          } else if (event === "USER_UPDATED") {
            toast.success("Профиль обновлен");
          } else if (event === "TOKEN_REFRESHED") {
            // Handle token refresh event
            console.log("Token refreshed");
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [navigate, authMethod, firebaseUser]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* WebGL Background */}
      <AppWebGLBackground />
      
      <Navigation />
      
      <div className="container min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Method Selection */}
          <div className="mb-6">
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "supabase" | "firebase")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="firebase">Firebase</TabsTrigger>
                <TabsTrigger value="supabase">Supabase</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Firebase Auth */}
          {authMethod === "firebase" && (
            <FirebaseAuth
              mode={firebaseMode}
              onModeChange={setFirebaseMode}
              onSuccess={() => navigate("/")}
            />
          )}

          {/* Supabase Auth */}
          {authMethod === "supabase" && (
            <Card className="w-full overflow-hidden border-2 border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg rounded-xl">
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <motion.div 
                    initial={{ scale: 0.8 }} 
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold font-cinzel bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
                      {authView === "sign_in" && "Вход в аккаунт"}
                      {authView === "sign_up" && "Регистрация"}
                      {authView === "email_register" && "Регистрация"}
                      {authView === "password_reset" && "Сброс пароля"}
                    </h1>
                  </motion.div>
                  <p className="text-muted-foreground">
                    {authView === "sign_in" && "Войдите, чтобы получить доступ к дополнительным возможностям"}
                    {authView === "sign_up" && "Создайте новый аккаунт"}
                    {authView === "email_register" && "Регистрация через email"}
                    {authView === "password_reset" && "Восстановите доступ к аккаунту"}
                  </p>
                </div>
              
{authView === "email_register" ? (
                <EmailCodeAuth 
                  mode="registration" 
                  onSuccess={() => navigate("/")} 
                />
              ) : authView === "password_reset" ? (
                <EmailCodeAuth 
                  mode="password_reset" 
                  onSuccess={() => {
                    setAuthView("sign_in");
                    toast.success("Теперь войдите с новым паролем");
                  }} 
                />
              ) : (
                <>
                  <SupabaseAuth
                    supabaseClient={supabase}
                    view={authView}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: 'hsl(var(--primary))',
                            brandAccent: 'hsl(var(--primary))',
                            brandButtonText: 'hsl(var(--primary-foreground))',
                            inputBorder: 'hsl(var(--border))',
                            inputText: 'hsl(var(--foreground))',
                            inputPlaceholder: 'hsl(var(--muted-foreground))',
                          },
                          radii: {
                            borderRadiusButton: '0.75rem',
                            buttonBorderRadius: '0.75rem',
                            inputBorderRadius: '0.75rem',
                          },
                          space: {
                            inputPadding: '0.75rem',
                            buttonPadding: '0.75rem',
                          },
                          fonts: {
                            bodyFontFamily: `'Cinzel', serif`,
                            buttonFontFamily: `'Cinzel', serif`,
                            inputFontFamily: `'Cinzel', serif`,
                          },
                        },
                      },
                      className: {
                        container: 'w-full',
                        button: 'w-full px-4 py-2.5 rounded-xl font-medium text-base hover:opacity-90 transition-all duration-150 shadow-sm',
                        input: 'w-full px-4 py-2.5 rounded-xl border text-base focus:ring-2 focus:ring-primary/30 transition-all duration-150',
                        label: 'text-foreground font-medium mb-1 block',
                        message: 'text-red-500 text-sm mt-1',
                        anchor: 'text-primary hover:text-primary/80 transition-colors',
                        divider: 'bg-border',
                      },
                    }}
                    localization={{
                      variables: {
                        sign_in: {
                          email_label: "Email адрес",
                          password_label: "Пароль",
                          button_label: "Войти",
                          social_provider_text: "Войти через {{provider}}",
                          link_text: "Уже есть аккаунт? Войти",
                        },
                        sign_up: {
                          email_label: "Email адрес",
                          password_label: "Пароль",
                          button_label: "Регистрация",
                          social_provider_text: "Зарегистрироваться через {{provider}}",
                          link_text: "Нет аккаунта? Зарегистрироваться",
                        },
                      },
                    }}
                    providers={[]}
                  />
                </>
              )}
              
              <div className="text-center pt-4 space-y-2">
                {authView === "sign_in" && (
                  <>
                    <button
                      className="text-primary hover:text-primary/80 hover:underline transition-all font-medium block w-full"
                      onClick={() => setAuthView("email_register")}
                    >
                      Регистрация через email
                    </button>
                    <button
                      className="text-muted-foreground hover:text-primary hover:underline transition-all font-medium block w-full text-sm"
                      onClick={() => setAuthView("password_reset")}
                    >
                      Забыли пароль?
                    </button>
                    <button
                      className="text-muted-foreground hover:text-primary hover:underline transition-all font-medium block w-full text-sm"
                      onClick={() => setAuthView("sign_up")}
                    >
                      Нет аккаунта? Зарегистрироваться
                    </button>
                  </>
                )}
                
                {authView === "sign_up" && (
                  <>
                    <button
                      className="text-primary hover:text-primary/80 hover:underline transition-all font-medium block w-full"
                      onClick={() => setAuthView("email_register")}
                    >
                      Регистрация через email
                    </button>
                    <button
                      className="text-muted-foreground hover:text-primary hover:underline transition-all font-medium block w-full text-sm"
                      onClick={() => setAuthView("sign_in")}
                    >
                      Уже есть аккаунт? Войти
                    </button>
                  </>
                )}
                
                {(authView === "email_register" || authView === "password_reset") && (
                  <button
                    className="text-muted-foreground hover:text-primary hover:underline transition-all font-medium block w-full text-sm"
                    onClick={() => setAuthView("sign_in")}
                  >
                    ← Назад к входу
                  </button>
                )}
              </div>
            </div>
          </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
