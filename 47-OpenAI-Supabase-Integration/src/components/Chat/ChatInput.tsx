/**
 * Chat input component
 */

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed min-h-[56px] max-h-[120px]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};
