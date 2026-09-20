import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, RefreshCw, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/navigation/Navigation";

interface ChatMessage {
  id: string;
  sender_name: string;
  content: string;
}

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (!isJoined) return; const channel = supabase.channel("chat_messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "simple_messages" }, (payload) => setMessages((current) => [...current, payload.new as ChatMessage])).on("postgres_changes", { event: "DELETE", schema: "public", table: "simple_messages" }, (payload) => setMessages((current) => payload.old ? current.filter((msg) => msg.id !== (payload.old as ChatMessage).id) : [])).subscribe(); fetchMessages(); return () => { supabase.removeChannel(channel); }; }, [isJoined]);
  useEffect(() => { scrollToBottom(); }, [messages]);
  const fetchMessages = async () => { const { data, error } = await supabase.from("simple_messages").select("*").order("created_at", { ascending: true }); if (error) return toast.error("Не удалось загрузить сообщения"); setMessages((data || []) as ChatMessage[]); };
  const handlePasswordSubmit = (event: React.FormEvent) => { event.preventDefault(); if (password === "Tetrixuno") { setIsAdmin(true); setIsJoined(true); toast.success("Вы вошли как администратор"); } else { toast.error("Неверный пароль"); setPassword(""); } };
  const handleJoin = (event: React.FormEvent) => { event.preventDefault(); if (!username.trim()) return; if (username === "AK") setShowPasswordInput(true); else { setIsJoined(true); toast.success("Добро пожаловать в чат"); } };
  const handleSubmit = async (event: React.FormEvent) => { event.preventDefault(); if (!message.trim()) return; const { error } = await supabase.from("simple_messages").insert([{ sender_name: username, content: message }]); if (error) return toast.error("Не удалось отправить сообщение"); setMessage(""); };
  const handleDeleteMessage = async (messageId: string) => { if (!isAdmin) return; const { error } = await supabase.from("simple_messages").delete().eq("id", messageId); toast[error ? "error" : "success"](error ? "Не удалось удалить сообщение" : "Сообщение удалено"); };
  const handleClearChat = async () => { if (!isAdmin || !window.confirm("Очистить сообщения в чате?")) return; const { error } = await supabase.from("simple_messages").delete().neq("id", "0"); toast[error ? "error" : "success"](error ? "Не удалось очистить чат" : "Чат очищен"); };

  if (!isJoined) return <div className="page-shell soft-grid"><Navigation /><main className="content-container grid min-h-screen place-items-center pt-28"><section className="surface-panel w-full max-w-md p-7 sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><MessageCircle className="h-6 w-6" /></span><p className="section-eyebrow mt-7">Сообщество</p><h1 className="mt-2 text-2xl font-extrabold">Присоединиться к чату</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Выберите имя, чтобы обмениваться рекомендациями и обсуждать кино.</p>{!showPasswordInput ? <form onSubmit={handleJoin} className="mt-6 space-y-3"><Input placeholder="Ваше имя" value={username} onChange={(event) => setUsername(event.target.value)} required /><Button type="submit" className="h-11 w-full">Войти в чат</Button></form> : <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-3"><Input type="password" placeholder="Пароль администратора" value={password} onChange={(event) => setPassword(event.target.value)} required /><Button type="submit" className="h-11 w-full">Подтвердить</Button></form>}</section></main></div>;

  return <div className="page-shell"><Navigation /><main className="content-container pt-28"><section className="surface-panel mx-auto max-w-4xl overflow-hidden"><header className="flex flex-col justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div><p className="section-eyebrow">Сообщество</p><h1 className="mt-1 text-xl font-extrabold">Онлайн-чат</h1><p className="mt-1 text-xs text-muted-foreground">Вы вошли как {username}{isAdmin ? " · администратор" : ""}</p></div>{isAdmin && <Button variant="outline" size="sm" onClick={handleClearChat} className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"><RefreshCw className="h-3.5 w-3.5" />Очистить</Button>}</header><div className="h-[58vh] space-y-4 overflow-y-auto bg-black/10 p-5 sm:p-6">{messages.length ? messages.map((msg) => <div key={msg.id} className={`flex ${msg.sender_name === username ? "justify-end" : "justify-start"}`}><div className="flex max-w-[85%] items-start gap-2"><div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${msg.sender_name === username ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-white/[0.08] bg-secondary text-foreground"}`}><p className={`mb-1 text-[10px] font-extrabold uppercase tracking-wide ${msg.sender_name === username ? "text-primary-foreground/70" : "text-primary"}`}>{msg.sender_name}</p><p>{msg.content}</p></div>{isAdmin && <button type="button" onClick={() => handleDeleteMessage(msg.id)} className="mt-1 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-white/[0.08] hover:text-destructive" aria-label="Удалить сообщение"><Trash2 className="h-3.5 w-3.5" /></button>}</div></div>) : <p className="pt-10 text-center text-sm text-muted-foreground">Чат ждёт первого сообщения.</p>}<div ref={messagesEndRef} /></div><form onSubmit={handleSubmit} className="border-t border-white/[0.08] p-4 sm:p-5"><div className="flex gap-2"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Напишите сообщение…" className="h-11" /><Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Отправить сообщение"><Send className="h-4 w-4" /></Button></div></form></section></main></div>;
}
