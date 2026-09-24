import { useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Mail, Lock, Eye, EyeOff, Chrome, Phone } from "lucide-react";
import { toast } from "sonner";

interface FirebaseAuthProps {
  onSuccess?: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export const FirebaseAuth = ({ onSuccess, mode, onModeChange }: FirebaseAuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPhoneCode, confirmPhoneCode } = useFirebaseAuth();

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return toast.error("Заполните email и пароль");
    if (mode === "signup" && password !== confirmPassword) return toast.error("Пароли не совпадают");
    if (mode === "signup" && password.length < 6) return toast.error("Пароль должен содержать минимум 6 символов");
    try {
      setIsLoading(true);
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password, displayName || undefined);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      if (!confirmation) {
        const normalizedPhone = normalizePhoneNumber(phone);
        if (!normalizedPhone) {
          toast.error("Введите корректный номер: +79856670606 или 89856670606");
          return;
        }
        setPhone(normalizedPhone);
        const result = await sendPhoneCode(normalizedPhone, "phone-recaptcha-container");
        setConfirmation(result);
      } else {
        await confirmPhoneCode(confirmation, verificationCode.trim());
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: "signin" | "signup") => {
    onModeChange(newMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  const switchAuthMethod = (method: "email" | "phone") => {
    setAuthMethod(method);
    setConfirmation(null);
    setPhone("");
    setVerificationCode("");
  };

  return (
    <Card className="border-white/[0.10] bg-card/95">
      <CardHeader className="pb-4 text-center">
        <p className="section-eyebrow">EVLOEVFILM</p>
        <CardTitle className="mt-3 text-2xl font-extrabold">{mode === "signin" ? "С возвращением" : "Создайте аккаунт"}</CardTitle>
        <CardDescription className="mt-2">{mode === "signin" ? "Войдите, чтобы продолжить просмотр." : "Сохраните фильмы и соберите личную подборку."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button onClick={handleGoogleAuth} disabled={isLoading} variant="outline" className="h-12 w-full border-white/[0.14] bg-white text-sm font-bold text-zinc-900 hover:bg-zinc-100">
          <Chrome className="h-4 w-4" />{mode === "signin" ? "Войти через Google" : "Продолжить с Google"}
        </Button>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-1">
          <button type="button" onClick={() => switchAuthMethod("email")} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${authMethod === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Email</button>
          <button type="button" onClick={() => switchAuthMethod("phone")} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${authMethod === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Телефон</button>
        </div>
        <div className="relative"><Separator /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">или</span></div>
        {authMethod === "phone" ? (
          <form onSubmit={handlePhoneAuth} className="space-y-4">
            <label className="block text-sm font-bold">Номер телефона<span className="relative mt-2 block"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+79991234567 или 89991234567" className="pl-10" disabled={isLoading || Boolean(confirmation)} required /></span><span className="mt-2 block text-xs font-medium text-muted-foreground">Введите российский номер с 8 или в международном формате с +7.</span></label>
            {confirmation && <label className="block text-sm font-bold">Код из SMS<Input inputMode="numeric" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} placeholder="123456" className="mt-2" disabled={isLoading} required /></label>}
            <div id="phone-recaptcha-container" />
            <Button type="submit" className="h-12 w-full" disabled={isLoading || (confirmation ? verificationCode.length < 4 : !normalizePhoneNumber(phone))}>{isLoading ? "Подождите…" : confirmation ? "Подтвердить код" : "Получить SMS-код"}</Button>
            {confirmation && <button type="button" onClick={() => setConfirmation(null)} className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground">Изменить номер</button>}
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && <label className="block text-sm font-bold">Имя<Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Как к вам обращаться?" className="mt-2" disabled={isLoading} /></label>}
            <label className="block text-sm font-bold">Email<span className="relative mt-2 block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="pl-10" disabled={isLoading} required /></span></label>
            <label className="block text-sm font-bold">Пароль<span className="relative mt-2 block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" className="pl-10 pr-10" disabled={isLoading} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            {mode === "signup" && <label className="block text-sm font-bold">Повторите пароль<span className="relative mt-2 block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Повторите пароль" className="pl-10 pr-10" disabled={isLoading} required /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>}
            <Button type="submit" className="mt-2 h-12 w-full" disabled={isLoading || !email || !password || (mode === "signup" && !confirmPassword)}>{isLoading ? "Подождите…" : mode === "signin" ? "Войти" : "Создать аккаунт"}</Button>
          </form>
        )}
        <button type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")} className="block w-full text-center text-sm font-bold text-primary transition hover:text-primary/75" disabled={isLoading}>{mode === "signin" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}</button>
      </CardContent>
    </Card>
  );
};

function normalizePhoneNumber(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("8") && digits.length === 11
    ? `+7${digits.slice(1)}`
    : digits.startsWith("7") && digits.length === 11
      ? `+${digits}`
      : value.trim().startsWith("+")
        ? `+${digits}`
        : null;

  return normalized && /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}
