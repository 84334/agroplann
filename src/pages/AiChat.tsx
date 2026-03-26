import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useChatHistory, type ChatMessage } from "@/hooks/useChatHistory";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User, Sparkles, Lock, Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export default function AiChat() {
  const { user } = useAuth();
  const { isProUser, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loadingConversations,
    loadingMessages,
    createConversation,
    saveMessage,
    deleteConversation,
    startNewChat,
    setActiveConversationId,
  } = useChatHistory();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<string | null>(null);

  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Sign in Required</h1>
        <p className="text-muted-foreground mb-4">Please sign in to access the AI assistant.</p>
        <button onClick={() => navigate("/auth")} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">Sign In</button>
      </div>
    );
  }

  if (subLoading) {
    return <div className="container py-16 text-center text-muted-foreground">Checking subscription...</div>;
  }

  if (!isProUser) {
    return (
      <div className="container py-16 text-center">
        <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Pro Feature</h1>
        <p className="text-muted-foreground mb-4">AI Chat is available exclusively for Pro subscribers.</p>
        <button onClick={() => navigate("/pricing")} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">Upgrade to Pro</button>
      </div>
    );
  }

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let convId = activeConvRef.current;
    if (!convId) {
      convId = await createConversation(userMsg.content);
      if (!convId) {
        setIsLoading(false);
        return;
      }
    }

    // Save user message
    await saveMessage(convId, "user", userMsg.content);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save complete assistant message
      if (assistantSoFar && convId) {
        await saveMessage(convId, "assistant", assistantSoFar);
      }
    } catch (e) {
      console.error("AI Chat error:", e);
      const errMsg = "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
      if (convId) await saveMessage(convId, "assistant", errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-muted/30 flex flex-col transition-all duration-200 shrink-0",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
      )}>
        <div className="p-3 border-b flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex-1 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                  c.id === activeConversationId
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
                onClick={() => setActiveConversationId(c.id)}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="truncate flex-1">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </button>
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">AgroPlan AI</h1>
            <p className="text-xs text-muted-foreground">Ask anything about farming</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">How can I help you today?</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Best crops for rainy season?", "How to improve soil health?", "How do I use the Timetable?"].map((q) => (
                  <button key={q} onClick={() => setInput(q)} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted prose prose-sm max-w-none dark:prose-invert"
                }`}>
                  {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
                {m.role === "user" && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about farming techniques, crop rotation..."
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
