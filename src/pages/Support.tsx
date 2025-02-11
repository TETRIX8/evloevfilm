
import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import emailjs from '@emailjs/browser';
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await emailjs.sendForm(
        'service_vcaxptx',
        'template_91c1fvw',
        formRef.current!,
        'aoak44iftoobsH4Xm'
      );

      if (result.text === 'OK') {
        toast.success("Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
        setSubject("");
        setMessage("");
      } else {
        throw new Error("Не удалось отправить сообщение");
      }
    } catch (error) {
      console.error("Error sending support email:", error);
      toast.error("Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-purple-500/5 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <Navigation />
      
      <main className="container pt-24 pb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Поддержка
            </h1>
            <p className="text-muted-foreground">
              У вас есть вопросы? Мы здесь, чтобы помочь!
            </p>
          </motion.div>

          <motion.form 
            ref={formRef} 
            onSubmit={handleSubmit} 
            className="space-y-6 bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-primary/10 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Ваш email"
                required
                readOnly={!!userEmail}
                className={`${userEmail ? "bg-muted" : ""} transition-all duration-300 hover:shadow-md focus:shadow-lg`}
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label htmlFor="subject" className="text-sm font-medium">
                Тема
              </label>
              <Input
                id="subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="О чем вы хотите сообщить?"
                required
                className="transition-all duration-300 hover:shadow-md focus:shadow-lg"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label htmlFor="message" className="text-sm font-medium">
                Сообщение
              </label>
              <Textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите вашу проблему или вопрос..."
                required
                className="min-h-[150px] transition-all duration-300 hover:shadow-md focus:shadow-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Отправить сообщение"}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </main>
    </div>
  );
}
