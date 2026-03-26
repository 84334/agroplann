import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChatHistory() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load conversations list
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }
    const load = async () => {
      setLoadingConversations(true);
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setConversations((data as Conversation[]) || []);
      setLoadingConversations(false);
    };
    load();
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const load = async () => {
      setLoadingMessages(true);
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });
      setMessages((data as ChatMessage[]) || []);
      setLoadingMessages(false);
    };
    load();
  }, [activeConversationId]);

  const createConversation = useCallback(
    async (firstMessage: string): Promise<string | null> => {
      if (!user) return null;
      const title = firstMessage.slice(0, 60) || "New Chat";
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();
      if (error || !data) return null;
      const newConv: Conversation = {
        id: data.id,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(data.id);
      return data.id;
    },
    [user]
  );

  const saveMessage = useCallback(
    async (conversationId: string, role: "user" | "assistant", content: string) => {
      await supabase.from("chat_messages").insert({ conversation_id: conversationId, role, content });
      // Update conversation's updated_at and title if first user message
      if (role === "user") {
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    },
    []
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      await supabase.from("chat_conversations").delete().eq("id", id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    },
    [activeConversationId]
  );

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  return {
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
  };
}
