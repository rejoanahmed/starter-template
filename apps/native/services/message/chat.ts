import { api } from "@app/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// Types
export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
  isRead: boolean;
};

export type ChatConversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isUnread: boolean;
};

export type ChatTemplate = {
  id: string;
  title: string;
  description?: string;
  content: string;
  trigger?:
    | "first_enquiry"
    | "2_hours_before_checkin"
    | "5_hours_before_checkin"
    | "12_hours_before_checkin"
    | "2_hours_before_checkout"
    | "5_hours_before_checkout"
    | "12_hours_before_checkout";
  isActive: boolean;
  audience: "all_paid_customers" | "specific_customers";
  createdAt: string;
  updatedAt: string;
};

// API functions
const fetchConversationsApi = async (): Promise<ChatConversation[]> => {
  const res = await api.api.messages.conversations.$get();

  if (!res.ok) {
    throw new Error(`Failed to fetch conversations: ${res.status}`);
  }

  const data = await res.json();
  return (data.conversations || []).map((conv) => ({
    ...conv,
    participantAvatar: conv.participantAvatar || "",
  }));
};

const fetchChatMessagesApi = async (chatId: string): Promise<ChatMessage[]> => {
  const res = await api.api.messages.conversations[":chatId"].$get({
    param: { chatId },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch messages: ${res.status}`);
  }

  const data = await res.json();
  return (data.messages || []).map((msg) => ({
    ...msg,
    senderAvatar: msg.senderAvatar || "",
  }));
};

const fetchChatTemplatesApi = async (): Promise<ChatTemplate[]> => {
  const res = await api.api.messages.templates.$get();

  if (!res.ok) {
    throw new Error(`Failed to fetch templates: ${res.status}`);
  }

  const data = await res.json();
  return (data.templates || []).map((template) => ({
    ...template,
    description: template.description || undefined,
    trigger: template.trigger || undefined,
  }));
};

// Send a message in a conversation
export const sendMessageApi = async (
  chatId: string,
  recipientId: string,
  content: string
) => {
  const res = await api.api.messages.conversations[":chatId"].$post({
    param: { chatId },
    json: { recipientId, content },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to send message");
  }

  const data = await res.json();
  return data.message;
};

// Start a new conversation
export const startConversationApi = async (
  recipientId: string,
  initialMessage?: string
) => {
  const res = await api.api.messages.conversations.$post({
    json: { recipientId, initialMessage },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to start conversation");
  }

  const data = await res.json();
  return data;
};

// Create a new template
export const createTemplateApi = async (template: {
  title: string;
  description?: string;
  content: string;
  trigger?: ChatTemplate["trigger"];
  isActive?: boolean;
  audience?: ChatTemplate["audience"];
}) => {
  const res = await api.api.messages.templates.$post({
    json: template,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create template");
  }

  const data = await res.json();
  return data.template;
};

// Update an existing template
export const updateTemplateApi = async (
  templateId: string,
  updates: {
    title?: string;
    description?: string;
    content?: string;
    trigger?: ChatTemplate["trigger"];
    isActive?: boolean;
    audience?: ChatTemplate["audience"];
  }
) => {
  const res = await api.api.messages.templates[":id"].$patch({
    param: { id: templateId },
    json: updates,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update template");
  }

  const data = await res.json();
  return data.template;
};

// Delete a template
export const deleteTemplateApi = async (templateId: string) => {
  const res = await api.api.messages.templates[":id"].$delete({
    param: { id: templateId },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete template");
  }

  const data = await res.json();
  return data.success;
};

// React Query hooks
export const useConversations = () => {
  return useQuery({
    queryKey: ["message", "conversations"],
    queryFn: fetchConversationsApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useChatMessages = (chatId: string) => {
  return useQuery({
    queryKey: ["message", "chat", chatId],
    queryFn: () => fetchChatMessagesApi(chatId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!chatId, // Only fetch if chatId is provided
  });
};

export const useChatTemplates = () => {
  return useQuery({
    queryKey: ["message", "templates"],
    queryFn: fetchChatTemplatesApi,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
};
