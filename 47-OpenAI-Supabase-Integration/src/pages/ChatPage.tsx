/**
 * Chat page component
 */

import { MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { MainLayout } from '@/components/Layout';
import { MessageList } from '@/components/Chat/MessageList';
import { ChatInput } from '@/components/Chat/ChatInput';

export const ChatPage = () => {
  const { messages, isLoading, error, sessionId, sendMessage, clearMessages, clearError } = useChat();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-160px)] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">AI Chat Assistant</h1>
                <p className="text-xs sm:text-sm text-blue-100 truncate">
                  Session: {sessionId.substring(0, 8)}...
                </p>
              </div>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Clear</span>
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
    </MainLayout>
  );
};
