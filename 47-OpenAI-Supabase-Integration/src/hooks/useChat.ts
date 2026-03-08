/**
 * Custom hook for chat functionality
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendChatMessage } from '@/services/chat.service';
import { generateSessionId, generateMessageId } from '@/utils/chat.utils';
import type { ChatMessage } from '@/types/chat.types';

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());

  /**
   * Sends a message to the chat webhook
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!content.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const result = await sendChatMessage({
      chatInput: content.trim(),
      sessionId,
      userId: user.id,
    });

    setIsLoading(false);

    if (result.success && result.response) {
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        content: result.response,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      setError(result.error || 'Failed to send message');
    }
  }, [user, sessionId]);

  /**
   * Clears all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    clearError,
  };
};
