
import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        setError('Номер телефона должен начинаться с + и кода страны (например, +7)');
        setLoading(false);
        return;
      }

      let response;
      
      if (authView === "sign_in") {
        // Sign in with phone
        response = await supabase.auth.signInWithPassword({
          phone: phoneNumber,
          password,
        });
      } else {
        // Sign up with phone
        response = await supabase.auth.signUp({
          phone: phoneNumber,
          password,
          options: {
            data: {
              phone: phoneNumber,
            }
          }
        });
      }

      if (response.error) {
        throw response.error;
      }

      if (authView === "sign_up" && response.data.user?.identities?.length === 0) {
        setError('Пользователь с таким номером телефона уже существует');
      } else if (authView === "sign_up") {
        toast.success('Код подтверждения отправлен на ваш телефон');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Произошла ошибка при авторизации');
    } finally {
      setLoading(false);
    }
  };

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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Номер телефона
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7XXXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {authView === "sign_in" ? "Вход..." : "Регистрация..."}
                </span>
              ) : (
                <>{authView === "sign_in" ? "Войти" : "Зарегистрироваться"}</>
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              type="button"
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
