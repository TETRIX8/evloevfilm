import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        if (referralCode) {
          try {
            // Get the referral record
            const { data: referral, error: referralError } = await supabase
              .from('referrals')
              .select('referrer_id, referred_user_id')
              .eq('referral_code', referralCode)
              .single();

            if (referralError) throw referralError;

            if (referral && !referral.referred_user_id) {
              // Update the referral with the new user's ID
              const { error: updateError } = await supabase
                .from('referrals')
                .update({ 
                  referred_user_id: session.user.id,
                  status: 'completed'
                })
                .eq('referral_code', referralCode);

              if (updateError) throw updateError;
              
              toast.success("Регистрация по реферальной ссылке успешно завершена!");
            }
          } catch (error) {
            console.error("Error processing referral:", error);
            toast.error("Ошибка при обработке реферальной ссылки");
          }
        } else {
          toast.success("Добро пожаловать!");
        }
        navigate("/");
      } else if (event === "PASSWORD_RECOVERY") {
        toast.info("Проверьте вашу почту для восстановления пароля");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, referralCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {referralCode ? "Регистрация по приглашению" : "Добро пожаловать"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {referralCode 
              ? "Зарегистрируйтесь, чтобы присоединиться к нашему сообществу"
              : "Войдите или зарегистрируйтесь, чтобы сохранять фильмы и отслеживать историю просмотров"}
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
                },
                forgotten_password: {
                  link_text: "Забыли пароль?",
                  button_label: "Отправить инструкции",
                  loading_button_label: "Отправка инструкций...",
                  confirmation_text: "Проверьте ваш email для восстановления пароля",
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