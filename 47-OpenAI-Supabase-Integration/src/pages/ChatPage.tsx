/**
 * Chat page component
 */

import { MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { Navbar } from '@/components/Navbar';
import { MessageList } from '@/components/Chat/MessageList';
import { ChatInput } from '@/components/Chat/ChatInput';

export const ChatPage = () => {
  const { messages, isLoading, error, sessionId, sendMessage, clearMessages, clearError } = useChat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navbar */}
      <Navbar />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-[calc(100vh-120px)] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Chat Assistant</h1>
                <p className="text-sm text-blue-100">Session: {sessionId.substring(0, 8)}...</p>
              </div>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Clear</span>
              </button>
            )}
          </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-700 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
