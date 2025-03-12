
import { Navigation } from "@/components/navigation/Navigation";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";

export default function Profile() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN") {
        toast.success("Добро пожаловать!");
      } else if (event === "SIGNED_OUT") {
        toast.success("Вы успешно вышли из системы");
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      toast.error("Ошибка при выходе из системы");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container pt-24 pb-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <div className="max-w-xl mx-auto space-y-8">
          {session ? (
            <Card>
              <CardHeader>
                <CardTitle>Профиль</CardTitle>
                <CardDescription>
                  Управление вашей учетной записью
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {session.user.phone ? `Телефон: ${session.user.phone}` : 
                     session.user.email ? `Email: ${session.user.email}` : "Аккаунт"}
                  </p>
                </div>
                <div className="space-y-4">
                  <PasswordChangeForm />
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Профиль</h1>
                <p className="text-muted-foreground">
                  Войдите или зарегистрируйтесь, чтобы получить доступ к дополнительным возможностям
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-lg border">
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(var(--primary))',
                          brandAccent: 'hsl(var(--primary))',
                          brandButtonText: 'white',
                          defaultButtonBackground: 'hsl(var(--secondary))',
                          defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                        },
                      },
                    },
                    className: {
                      container: 'w-full',
                      button: 'w-full px-4 py-2 rounded-md',
                      input: 'w-full px-3 py-2 rounded-md border',
                      label: 'text-foreground',
                      loader: 'text-primary',
                    },
                  }}
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: "Телефон",
                        password_label: "Пароль",
                        email_input_placeholder: "Ваш номер телефона",
                        password_input_placeholder: "Ваш пароль",
                        button_label: "Войти",
                        loading_button_label: "Вход...",
                        social_provider_text: "Войти через {{provider}}",
                        link_text: "Уже есть аккаунт? Войти",
                      },
                      sign_up: {
                        email_label: "Телефон",
                        password_label: "Пароль",
                        email_input_placeholder: "Ваш номер телефона",
                        password_input_placeholder: "Ваш пароль",
                        button_label: "Зарегистрироваться",
                        loading_button_label: "Регистрация...",
                        social_provider_text: "Зарегистрироваться через {{provider}}",
                        link_text: "Нет аккаунта? Зарегистрироваться",
                      },
                      forgotten_password: {
                        email_label: "Телефон",
                        button_label: "Отправить инструкции",
                      },
                      magic_link: {
                        email_input_label: "Телефон",
                        button_label: "Отправить магическую ссылку",
                      },
                      phone_confirmation: {
                        confirmation_code_label: "Код подтверждения",
                        confirmation_code_input_placeholder: "Введите код подтверждения",
                        button_label: "Подтвердить",
                        confirmation_text: "Мы отправили код подтверждения на ваш телефон"
                      },
                    },
                  }}
                  theme="dark"
                  providers={[]}
                  otpType="sms"
                  redirectTo={window.location.origin}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
