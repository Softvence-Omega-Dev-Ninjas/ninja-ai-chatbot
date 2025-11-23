import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-lg rounded-tr-none"
            : "bg-card text-foreground border border-border rounded-lg rounded-tl-none",
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
      </Card>
    </div>
  )
}
