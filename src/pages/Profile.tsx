import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    
    getUserEmail();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Пароль успешно обновлен!");
      setNewPassword("");
    } catch (error) {
      toast.error("Ошибка при обновлении пароля. Пожалуйста, попробуйте позже.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container pt-24 pb-16">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Профиль</h1>
            <p className="text-muted-foreground">
              Управляйте своими настройками
            </p>
          </div>

          <div className="space-y-6">
            {userEmail && (
              <div className="p-6 rounded-lg bg-card">
                <h2 className="text-xl font-semibold mb-2">Email</h2>
                <p className="text-muted-foreground">{userEmail}</p>
              </div>
            )}

            <div className="p-6 rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-4">Изменить пароль</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    Новый пароль
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Введите новый пароль"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Обновление..." : "Обновить пароль"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}