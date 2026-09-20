import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";
import { Headphones, Mail, Send } from "lucide-react";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user?.email) setUserEmail(session.user.email); }); }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await emailjs.sendForm("service_vcaxptx", "template_91c1fvw", formRef.current!, "aoak44iftoobsH4Xm");
      if (result.text !== "OK") throw new Error("Email service failed");
      toast.success("Сообщение отправлено. Мы ответим по указанному email.");
      setSubject(""); setMessage("");
    } catch (error) {
      console.error("Support request error:", error);
      toast.error("Не удалось отправить сообщение. Попробуйте позже.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="page-shell soft-grid"><Navigation />
      <main className="content-container pt-28"><div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <section className="surface-panel h-fit p-6 sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Headphones className="h-6 w-6" /></span><p className="section-eyebrow mt-7">На связи</p><h1 className="section-heading">Поддержка</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Опишите, что произошло: чем точнее детали, тем быстрее получится помочь.</p><div className="mt-8 border-t border-white/[0.08] pt-5"><p className="text-sm font-bold">О чём можно написать?</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Вход в аккаунт, работа плеера, избранное, ошибки в каталоге или предложение для сервиса.</p></div></section>
        <form ref={formRef} onSubmit={handleSubmit} className="surface-panel space-y-5 p-6 sm:p-8"><div><p className="section-eyebrow">Обращение</p><h2 className="mt-2 text-xl font-extrabold">Как можем помочь?</h2></div><label className="block text-sm font-bold">Email<Input id="email" name="email" type="email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} placeholder="name@example.com" required readOnly={Boolean(userEmail)} className="mt-2" /></label><label className="block text-sm font-bold">Тема<Input id="subject" name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Коротко опишите вопрос" required className="mt-2" /></label><label className="block text-sm font-bold">Сообщение<Textarea id="message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Опишите ситуацию и укажите, на каком шаге возникла проблема" required className="mt-2 min-h-[160px] rounded-xl border-input bg-background/80" /></label><Button type="submit" disabled={isSubmitting} className="h-12 w-full"><Send className="h-4 w-4" />{isSubmitting ? "Отправляем…" : "Отправить сообщение"}</Button><p className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5 text-primary" />Ответ придёт на указанный email.</p></form>
      </div></main>
    </div>
  );
}
