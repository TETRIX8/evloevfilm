import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Новый пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      setIsChanging(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Пароль успешно изменен");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error("Ошибка при смене пароля");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div>
        <Input
          type="password"
          placeholder="Новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-2"
        />
      </div>
      <Button 
        type="submit" 
        variant="outline"
        disabled={isChanging || !newPassword}
        className="w-full"
      >
        {isChanging ? "Изменение..." : "Изменить пароль"}
      </Button>
    </form>
  );
};