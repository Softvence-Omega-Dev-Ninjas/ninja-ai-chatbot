"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, Loader2 } from "lucide-react"
import ChatMessage from "./chat-message"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      const response = await fetch("http://103.174.189.183:8080/api/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: input,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.response) {
                fullResponse += data.response
                // Update the assistant message in real-time
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg)),
                )
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.error("[v0] Invalid JSON line:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error calling Ollama API:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <h1 className="text-2xl font-bold text-foreground">Ollama Chat</h1>
        <p className="text-sm text-muted-foreground">Chat with Llama 3.2 model</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">Start a conversation with Ollama</p>
              <p className="text-sm text-muted-foreground mt-2">Your messages will appear here</p>
            </div>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
