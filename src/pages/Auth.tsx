
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthSession } from "@supabase/supabase-js";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

export default function Auth() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) navigate("/");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      switch (event) {
        case "SIGNED_IN":
          toast.success("Вы успешно вошли в систему!");
          break;
        case "SIGNED_OUT":
          toast.success("Вы успешно вышли из системы!");
          break;
        case "USER_UPDATED":
          toast.success("Профиль пользователя обновлен!");
          break;
        case "PASSWORD_RECOVERY":
          toast.info("Ссылка для сброса пароля отправлена!");
          break;
        default:
          if (event === "USER_DELETED") {
            toast.info("Аккаунт пользователя удален");
          } else if (event === "ERROR") {
            toast.error("Произошла ошибка при аутентификации");
          }
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return null;
  }

  return (
    <div className="container max-w-lg mx-auto pt-24 pb-16">
      <SupabaseAuth 
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          style: { 
            button: { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
            anchor: { color: 'hsl(var(--primary))' }
          },
          variables: {
            default: {
              colors: {
                brand: 'hsl(var(--primary))',
                brandAccent: 'hsl(var(--primary))',
              }
            }
          }
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: "Email",
              password_label: "Пароль",
            }
          }
        }}
        theme={theme === 'dark' ? 'dark' : 'default'}
        providers={[]}
        redirectTo={window.location.origin}
      />
    </div>
  );
}
