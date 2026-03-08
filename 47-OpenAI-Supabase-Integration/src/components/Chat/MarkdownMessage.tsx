/**
 * Markdown message renderer component
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  isUser: boolean;
}

export const MarkdownMessage = ({ content, isUser }: MarkdownMessageProps) => {
  return (
    <div className={`prose prose-sm max-w-none ${
      isUser 
        ? 'prose-invert' 
        : 'prose-slate'
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0">{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="ml-2">{children}</li>
        ),
        // Code
        code: ({ children, ...props }) => {
          const inline = !props.className;
          return inline ? (
            <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-200 text-slate-800'
            }`}>
              {children}
            </code>
          ) : (
            <code className={`block p-2 rounded text-xs font-mono overflow-x-auto ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 text-slate-800'
            }`}>
              {children}
            </code>
          );
        },
        // Emphasis
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:no-underline ${
              isUser ? 'text-blue-200' : 'text-blue-600'
            }`}
          >
            {children}
          </a>
        ),
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className={`border-l-4 pl-3 italic my-2 ${
            isUser 
              ? 'border-blue-300' 
              : 'border-slate-300'
          }`}>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};
