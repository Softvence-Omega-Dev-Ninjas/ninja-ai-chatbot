"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary"
            : "bg-gradient-to-br from-purple-500 to-pink-500"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      <Card
        className={cn(
          "max-w-[75%] px-4 py-3 shadow-sm transition-all hover:shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border-border/50"
        )}
      >
        <div className={cn("text-sm leading-relaxed break-words", !isUser && "prose prose-sm dark:prose-invert max-w-none")}>
          {message.content ? (
            isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            )
          ) : (
            <span className="text-muted-foreground italic">Thinking...</span>
          )}
        </div>
      </Card>
    </div>
  );
}
