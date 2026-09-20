import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation/Navigation";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

export default function Auth() {
  const navigate = useNavigate();
  const [firebaseMode, setFirebaseMode] = useState<"signin" | "signup">("signin");
  const { user: firebaseUser } = useFirebaseAuth();

  useEffect(() => { if (firebaseUser) navigate("/"); }, [navigate, firebaseUser]);

  return (
    <div className="page-shell soft-grid">
      <Navigation />
      <main className="content-container grid min-h-screen items-center gap-10 pt-28 lg:grid-cols-[.9fr_1.1fr]">
        <section className="max-w-xl">
          <p className="section-eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Ваше личное кино</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.08em] sm:text-5xl">Сохраняйте то, что хочется пересмотреть.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">Войдите, чтобы собрать личную подборку, продолжать просмотр и получать рекомендации в чате.</p>
          <div className="mt-9 flex items-center gap-4 border-l border-primary pl-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Film className="h-5 w-5" /></span><p className="text-sm font-semibold leading-6 text-foreground">Один аккаунт для избранного,<br />истории и настроек.</p></div>
        </section>
        <section className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"><FirebaseAuth mode={firebaseMode} onModeChange={setFirebaseMode} onSuccess={() => navigate("/")} /></section>
      </main>
    </div>
  );
}
