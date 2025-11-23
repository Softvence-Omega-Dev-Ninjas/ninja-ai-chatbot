import ChatInterface from "@/components/chat-interface"

export const metadata = {
  title: "Ollama Chat",
  description: "Chat with Ollama models with streaming support",
}

export default function Home() {
  return (
    <main className="h-screen bg-background">
      <ChatInterface />
    </main>
  )
}
