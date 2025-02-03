import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { AIMessage } from "./AIMessage";
import { QuickActions } from "./QuickActions";
import { useAIChat } from "@/hooks/use-ai-chat";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage } = useAIChat();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">Киноассистент</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <QuickActions onAction={sendMessage} />
            ) : (
              <>
                {messages.map((message, index) => (
                  <AIMessage 
                    key={index} 
                    message={message} 
                    isThinking={index === messages.length - 1 && isLoading && message.role === "user"}
                  />
                ))}
                {isLoading && (
                  <AIMessage 
                    message={{ role: "assistant", content: "" }} 
                    isThinking={true}
                  />
                )}
              </>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите что-нибудь о фильмах..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                Отправить
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}