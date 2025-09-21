import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Eye, EyeOff } from "lucide-react";

interface EmailCodeAuthProps {
  onSuccess?: () => void;
  mode: 'registration' | 'password_reset';
}

export const EmailCodeAuth = ({ onSuccess, mode }: EmailCodeAuthProps) => {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Введите email адрес");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Введите корректный email адрес");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-email-code', {
        body: { email, type: mode }
      });

      if (error) throw error;

      toast.success("Код отправлен на ваш email");
      setIsCodeSent(true);
      setStep('code');
      
      // Для тестирования показываем код (в продакшене убрать!)
      if (data?.debug_code) {
        toast.info(`Код для тестирования: ${data.debug_code}`);
      }
      
    } catch (error: any) {
      toast.error(error.message || "Ошибка при отправке кода");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast.error("Введите 6-значный код");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { 
          email, 
          code, 
          type: mode,
          ...(mode === 'registration' && password ? { password } : {})
        }
      });

      if (error) throw error;

      if (mode === 'registration') {
        toast.success("Аккаунт успешно создан!");
        onSuccess?.();
      } else {
        toast.success("Код подтвержден");
        setStep('password');
      }
      
    } catch (error: any) {
      toast.error(error.message || "Неверный код");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase.functions.invoke('reset-password', {
        body: { email, newPassword: password }
      });

      if (error) throw error;

      toast.success("Пароль успешно изменен!");
      onSuccess?.();
      
    } catch (error: any) {
      toast.error(error.message || "Ошибка при смене пароля");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <motion.form onSubmit={sendCode} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 rounded-xl"
            disabled={isLoading}
          />
        </div>
        
        {mode === 'registration' && (
          <>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Создайте пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 rounded-xl"
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10 rounded-xl"
                disabled={isLoading}
              />
            </div>
          </>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full rounded-xl"
        disabled={isLoading || !email || (mode === 'registration' && (!password || !confirmPassword))}
        size="lg"
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
            Отправка...
          </>
        ) : (
          `Отправить код ${mode === 'registration' ? 'регистрации' : 'сброса'}`
        )}
      </Button>
    </motion.form>
  );

  const renderCodeStep = () => (
    <motion.form onSubmit={verifyCode} className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Код отправлен на <strong>{email}</strong>
        </p>
      </div>
      
      <Input
        type="text"
        placeholder="Введите 6-značный код"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="text-center text-2xl tracking-widest rounded-xl"
        disabled={isLoading}
        maxLength={6}
      />
      
      <div className="flex gap-2">
        <Button 
          type="button"
          variant="outline"
          onClick={() => {setStep('email'); setCode(''); setIsCodeSent(false);}}
          className="w-full rounded-xl"
          disabled={isLoading}
        >
          Назад
        </Button>
        
        <Button 
          type="submit" 
          className="w-full rounded-xl"
          disabled={isLoading || code.length !== 6}
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
              Проверка...
            </>
          ) : (
            'Подтвердить код'
          )}
        </Button>
      </div>
      
      <Button 
        type="button"
        variant="ghost"
        onClick={sendCode}
        className="w-full text-sm"
        disabled={isLoading}
      >
        Отправить код повторно
      </Button>
    </motion.form>
  );

  const renderPasswordStep = () => (
    <motion.form onSubmit={resetPassword} className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 rounded-xl"
            disabled={isLoading}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pr-10 rounded-xl"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full rounded-xl"
        disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
        size="lg"
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
            Сохранение...
          </>
        ) : (
          'Изменить пароль'
        )}
      </Button>
    </motion.form>
  );

  const getTitle = () => {
    if (mode === 'registration') {
      return step === 'code' ? 'Подтверждение регистрации' : 'Регистрация';
    } else {
      if (step === 'email') return 'Сброс пароля';
      if (step === 'code') return 'Введите код';
      return 'Новый пароль';
    }
  };

  const getDescription = () => {
    if (mode === 'registration') {
      return step === 'code' 
        ? 'Введите код из письма для завершения регистрации'
        : 'Создайте новый аккаунт';
    } else {
      if (step === 'email') return 'Введите email для получения кода сброса';
      if (step === 'code') return 'Проверьте почту и введите полученный код';
      return 'Придумайте новый пароль для входа';
    }
  };

  return (
    <Card className="w-full border-2 border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-cinzel bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
          {getTitle()}
        </CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'password' && renderPasswordStep()}
      </CardContent>
    </Card>
  );
};