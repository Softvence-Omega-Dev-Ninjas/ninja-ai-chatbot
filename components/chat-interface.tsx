"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, Loader2, Sparkles, Bot, Send } from "lucide-react";
import { ChatMessage } from "./chat-message";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const response = await fetch("http://103.174.189.183:8080/api/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "ninja-ai",
          prompt: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          // Keep the last line in the buffer as it might be incomplete
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullResponse }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Invalid JSON line:", line, e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `❌ Error: ${error instanceof Error ? error.message : "Failed to get response"
            }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Dev Ninja AI
              </h1>
              <p className="text-xs text-muted-foreground">Powered by Ollama</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in-50 duration-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-6">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Start a Conversation
              </h2>
              <p className="text-muted-foreground max-w-md">
                Ask me anything! I'm here to help with coding, general
                knowledge, and more.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Explain how React hooks work",
                  "Write a Python sorting algorithm",
                  "What's the latest in AI?",
                  "Help me debug this code",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-4 py-3">
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card/80 backdrop-blur-sm shadow-lg sticky bottom-0">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-background shadow-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0 shadow-sm hover:shadow-md transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
