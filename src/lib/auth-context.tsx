import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ExternalLink, KeyRound, Loader2, Send, ShieldCheck, X } from "lucide-react";

export interface AuthUser { id: string; username: string | null; name: string; registeredAt: string; subscribed: boolean }
interface AuthContextValue { user: AuthUser | null; loading: boolean; open: boolean; openLogin: () => void; closeLogin: () => void; verifyCode: (code: string) => Promise<void>; logout: () => Promise<void>; error: string; }
const AuthContext = createContext<AuthContextValue | null>(null);
const BOT_URL = "https://t.me/AkSMSVerify_bot?start=site";
const CHANNEL_URL = "https://t.me/a_kproject";

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/auth/me", { credentials: "include" }).then((r) => r.ok ? r.json() : null).then((v) => setUser(v?.user ?? null)).catch(() => undefined).finally(() => setLoading(false)); }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user, loading, open,
    openLogin: () => { setError(""); setOpen(true); },
    closeLogin: () => { setError(""); setOpen(false); },
    verifyCode: async (code) => {
      setError("");
      const response = await fetch("/api/auth/verify", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { const message = data.message || "Не удалось подтвердить код"; setError(message); throw new Error(message); }
      setUser(data.user); setOpen(false);
    },
    logout: async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined); setUser(null); },
    error,
  }), [user, loading, open, error]);
  return <AuthContext.Provider value={value}>{children}<AuthModal /></AuthContext.Provider>;
}

function AuthModal() {
  const { open, closeLogin, verifyCode, error } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const submit = async () => { if (code.length !== 6) return; setBusy(true); try { await verifyCode(code); setCode(""); } catch { /* context displays server error through a local fallback below */ } finally { setBusy(false); } };
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-5 py-8 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Регистрация через Telegram">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-[#0d0d16] p-6 shadow-2xl shadow-black/60 sm:p-8">
        <button type="button" onClick={closeLogin} aria-label="Закрыть" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/25"><Send className="h-7 w-7" /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Доступ к просмотру</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">Войдите через Telegram</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">Подписка на канал обязательна. Бот выдаст одноразовый код — пароль вводить не нужно.</p>
        <div className="mt-6 grid gap-3">
          <a href={BOT_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-sky-500/15 px-4 py-3 text-sm font-bold text-sky-200 ring-1 ring-sky-400/25 transition hover:bg-sky-500/25"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-white"><Send className="h-4 w-4" /></span><span className="flex-1">Открыть бота и получить код<small className="mt-0.5 block font-normal text-sky-200/60">@AkSMSVerify_bot</small></span><ExternalLink className="h-4 w-4" /></a>
          <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-gold-400/10 px-4 py-3 text-sm font-bold text-gold-200 ring-1 ring-gold-400/20 transition hover:bg-gold-400/20"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-400 text-ink-950"><ShieldCheck className="h-4 w-4" /></span><span className="flex-1">Подписаться на канал<small className="mt-0.5 block font-normal text-gold-200/60">@a_kproject</small></span><ExternalLink className="h-4 w-4" /></a>
        </div>
        <label className="mt-7 block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Код из Telegram</label>
        <div className="mt-2 flex gap-2"><div className="relative flex-1"><KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && void submit()} inputMode="numeric" placeholder="000000" className="w-full rounded-2xl bg-white/[0.06] py-3.5 pl-11 pr-4 text-center text-lg font-bold tracking-[0.35em] text-white outline-none ring-1 ring-white/10 transition focus:ring-gold-400/60" /></div><button type="button" disabled={busy || code.length !== 6} onClick={() => void submit()} className="grid min-w-14 place-items-center rounded-2xl bg-gold-400 px-4 text-ink-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}</button></div>
        {error && <p className="mt-3 rounded-xl bg-rose-400/10 px-3 py-2 text-xs leading-relaxed text-rose-200">{error}</p>}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-600">Код действует 10 минут. Мы не запрашиваем пароль или данные карты.</p>
      </div>
    </div>
  );
}
