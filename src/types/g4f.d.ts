declare module "@gpt4free/g4f.dev" {
  type Message = { role: string; content: string };
  type ChatResult = { choices?: Array<{ message?: { content?: string } }> };

  export default class Client {
    chat: {
      completions: {
        create(options: { model?: string; messages: Message[] }): Promise<ChatResult>;
      };
    };
  }
}
