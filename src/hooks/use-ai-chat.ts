
import { useState } from "react";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

// RapidAPI configuration
const RAPID_API_KEY = "b8c60158ecmshf686ec6d369db30p13a15djsn4a09490cf7cc";
const RAPID_API_HOST = "chatgpt-vision1.p.rapidapi.com";
const RAPID_API_URL = "https://chatgpt-vision1.p.rapidapi.com/gpt4";

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { role: "user", content }]);

      // Prepare message history for the API call
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({ role: "user", content });

      // Prepare the request data
      const requestData = JSON.stringify({
        messages: messageHistory,
        web_access: false
      });

      // Make the API request
      const response = await fetch(RAPID_API_URL, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST,
          'Content-Type': 'application/json'
        },
        body: requestData
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Parse the response
      const responseData = await response.json();
      
      if (responseData.status && responseData.result) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseData.result }
        ]);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
}
