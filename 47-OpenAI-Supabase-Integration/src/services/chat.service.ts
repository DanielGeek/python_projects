/**
 * Service layer for chat operations
 */

import { API } from '@/config/constants';
import type { ChatRequest, ChatResponse } from '@/types/chat.types';

/**
 * Sends a chat message to the n8n webhook
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch(API.N8N_CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: request.chatInput,
        sessionId: request.sessionId,
        userId: request.userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      response: data.response || data.message || 'Message received',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
};
