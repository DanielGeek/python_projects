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

    let responseText = 'Message received';
    
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      responseText = data[0].output;
    } else if (data.output) {
      responseText = data.output;
    } else if (data.response) {
      responseText = data.response;
    } else if (data.message) {
      responseText = data.message;
    }

    return {
      success: true,
      response: responseText,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
};
