
import { Navigation } from "@/components/navigation/Navigation";
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
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in");
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);

    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        setError('Номер телефона должен начинаться с + и кода страны (например, +7)');
        setAuthLoading(false);
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
      setAuthLoading(false);
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

              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-phone" className="text-sm font-medium">
                      Номер телефона
                    </label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      placeholder="+7XXXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="profile-password" className="text-sm font-medium">
                      Пароль
                    </label>
                    <Input
                      id="profile-password"
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
                    disabled={authLoading}
                  >
                    {authLoading ? (
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

                  <div className="text-center pt-2">
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
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
