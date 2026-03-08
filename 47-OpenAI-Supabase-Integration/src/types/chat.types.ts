/**
 * Type definitions for chat functionality
 */

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatRequest {
  chatInput: string;
  sessionId: string;
  userId: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  response?: string;
  error?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
}
