
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем текущую сессию при загрузке
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    // Подписываемся на изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session);

      switch (event) {
        case "SIGNED_IN":
          toast.success("Добро пожаловать!");
          navigate("/");
          break;
        case "SIGNED_OUT":
          toast.success("Вы успешно вышли из системы");
          break;
        case "PASSWORD_RECOVERY":
          toast.info("Проверьте вашу почту для восстановления пароля");
          break;
        case "USER_UPDATED":
          toast.success("Профиль обновлен");
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Добро пожаловать</h2>
          <p className="mt-2 text-muted-foreground">
            Войдите или зарегистрируйтесь, чтобы сохранять фильмы и отслеживать историю просмотров
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-lg border">
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            showLinks={true}
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
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
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
                  email_label: "Email",
                  password_label: "Пароль",
                  email_input_placeholder: "Ваш email",
                  password_input_placeholder: "Ваш пароль",
                  button_label: "Войти",
                  loading_button_label: "Вход...",
                  social_provider_text: "Войти через {{provider}}",
                  link_text: "Уже есть аккаунт? Войти",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Пароль",
                  email_input_placeholder: "Ваш email",
                  password_input_placeholder: "Ваш пароль",
                  button_label: "Зарегистрироваться",
                  loading_button_label: "Регистрация...",
                  social_provider_text: "Зарегистрироваться через {{provider}}",
                  link_text: "Нет аккаунта? Зарегистрироваться",
                  confirmation_text: "Проверьте вашу почту для подтверждения регистрации",
                },
                forgotten_password: {
                  link_text: "Забыли пароль?",
                  button_label: "Отправить инструкции",
                  loading_button_label: "Отправка инструкций...",
                  confirmation_text: "Проверьте ваш email для восстановления пароля",
                },
                magic_link: {
                  button_label: "Войти по ссылке",
                  loading_button_label: "Отправка ссылки...",
                  confirmation_text: "Проверьте ваш email для входа",
                },
              },
            }}
            theme="dark"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}
