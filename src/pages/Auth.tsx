
import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in");
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    checkUser();
    
    // Set up auth state change listener
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
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {authView === "sign_in" ? "Вход в аккаунт" : "Регистрация"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {authView === "sign_in"
                ? "Войдите, чтобы получить доступ к вашему аккаунту"
                : "Создайте новый аккаунт"
              }
            </p>
          </div>
          
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
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Номер телефона",
                  password_label: "Пароль",
                  button_label: "Войти",
                  social_provider_text: "Войти через {{provider}}",
                  link_text: "Уже есть аккаунт? Войти",
                },
                sign_up: {
                  email_label: "Номер телефона",
                  password_label: "Пароль",
                  button_label: "Регистрация",
                  social_provider_text: "Зарегистрироваться через {{provider}}",
                  link_text: "Нет аккаунта? Зарегистрироваться",
                },
                forgotten_password: {
                  email_label: "Номер телефона",
                  password_label: "Пароль",
                  button_label: "Отправить инструкции",
                },
                magic_link: {
                  email_input_label: "Номер телефона",
                  button_label: "Отправить магическую ссылку",
                }
              },
            }}
            providers={[]}
            otpType="sms"
            redirectTo={window.location.origin}
          />
          
          <div className="text-center">
            <button
              className="text-primary hover:underline"
              onClick={() => setAuthView(authView === "sign_in" ? "sign_up" : "sign_in")}
            >
              {authView === "sign_in"
                ? "Нет аккаунта? Зарегистрироваться"
                : "Уже есть аккаунт? Войти"
              }
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
