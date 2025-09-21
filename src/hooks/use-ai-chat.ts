
import { useState } from "react";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

// FullAI API configuration
const FULLAI_API_BASE_URL = "https://fullai.vercel.app";
const DEFAULT_MODEL = "gpt-5-nano";

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { role: "user", content }]);

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(content);
      const apiUrl = `${FULLAI_API_BASE_URL}/${encodedMessage}?model=${DEFAULT_MODEL}`;
      
      console.log('Sending request to:', apiUrl);

      // Send message to FullAI API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      // Get response as text
      const responseText = await response.text();
      
      if (responseText.trim()) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseText.trim() }
        ]);
      } else {
        throw new Error("Empty response from API");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Не удалось получить ответ от AI-ассистента");
      
      // Remove the user message that failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Check API status on component mount
  const checkAPIStatus = async () => {
    try {
      const response = await fetch(`${FULLAI_API_BASE_URL}/hello?model=${DEFAULT_MODEL}`);
      const data = await response.text();
      console.log('FullAI API Status:', data);
    } catch (error) {
      console.error('API status check failed:', error);
    }
  };

  // Initialize API check
  useState(() => {
    checkAPIStatus();
  });

  return {
    messages,
    isLoading,
    sendMessage
  };
}
