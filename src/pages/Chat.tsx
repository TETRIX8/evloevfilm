
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isJoined) {
      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'simple_messages'
          },
          (payload) => {
            setMessages(current => [...current, payload.new]);
          }
        )
        .subscribe();

      fetchMessages();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isJoined]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('simple_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast.error("Ошибка при загрузке сообщений");
      return;
    }

    setMessages(data || []);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Tetrixuno") {
      setIsAdmin(true);
      setIsJoined(true);
      toast.success("Вы вошли как администратор!");
    } else {
      toast.error("Неверный пароль");
      setPassword("");
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      if (username === "AK") {
        setShowPasswordInput(true);
      } else {
        setIsJoined(true);
        toast.success("Добро пожаловать в чат!");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const { error } = await supabase
      .from('simple_messages')
      .insert([
        { sender_name: username, content: message }
      ]);

    if (error) {
      toast.error("Ошибка при отправке сообщения");
      return;
    }

    setMessage("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('simple_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast.error("Ошибка при удалении сообщения");
      return;
    }

    setMessages(messages.filter(msg => msg.id !== messageId));
    toast.success("Сообщение удалено");
  };

  const handleClearChat = async () => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('simple_messages')
      .delete()
      .neq('id', '0');

    if (error) {
      toast.error("Ошибка при очистке чата");
      return;
    }

    setMessages([]);
    toast.success("Чат очищен");
  };

  if (!isJoined) {
    return (
      <div className="container max-w-2xl mx-auto pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-8 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Присоединиться к чату</h1>
          {!showPasswordInput ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                type="text"
                placeholder="Введите ваше имя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                required
              />
              <Button type="submit" className="w-full">
                Войти в чат
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Введите пароль администратора"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
              <Button type="submit" className="w-full">
                Подтвердить
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b bg-muted flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Онлайн чат</h1>
            <p className="text-sm text-muted-foreground">
              Вы вошли как: {username} {isAdmin && "(Администратор)"}
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearChat}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Очистить чат
            </Button>
          )}
        </div>
        
        <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex flex-col ${msg.sender_name === username ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`max-w-[80%] break-words p-3 rounded-lg ${
                    msg.sender_name === username 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
