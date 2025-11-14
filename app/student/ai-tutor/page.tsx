"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, MessageCircle, Lightbulb, BookOpen } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: string
}

interface Topic {
  id: string
  name: string
  icon: string
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI Tutor. I'm here to help you understand concepts, solve problems, and improve your learning. What would you like to learn about today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const topics: Topic[] = [
    { id: "1", name: "Data Structures", icon: "📊" },
    { id: "2", name: "Algorithms", icon: "⚙️" },
    { id: "3", name: "Aptitude", icon: "🧮" },
    { id: "4", name: "Problem Solving", icon: "🔍" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: String(messages.length + 1),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's a great question! Let me explain this concept step by step...",
        "I can help you with that. Here's what you need to know...",
        "Excellent question! This relates to several important concepts...",
        "Let me break this down for you with an example...",
      ]

      const aiMessage: Message = {
        id: String(messages.length + 2),
        type: "ai",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date().toLocaleTimeString(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setLoading(false)
    }, 1000)
  }

  const handleTopicClick = (topic: Topic) => {
    setInput(`Explain ${topic.name} to me`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-muted-foreground">Get instant help with your studies 24/7</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat with AI Tutor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-muted-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg rounded-bl-none">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4 space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loading}
                />
                <Button onClick={handleSendMessage} disabled={loading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Quick Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topics.map((topic) => (
                <Button
                  key={topic.id}
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10 bg-transparent"
                  onClick={() => handleTopicClick(topic)}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Be Specific</p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                  Ask detailed questions for better answers
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-semibold text-green-900 dark:text-green-100">Ask Examples</p>
                <p className="text-xs text-green-800 dark:text-green-200 mt-1">Request examples to understand better</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="font-semibold text-purple-900 dark:text-purple-100">Follow Up</p>
                <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">Ask follow-up questions to clarify</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
