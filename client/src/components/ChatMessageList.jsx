import React from 'react';
import TypingIndicator from './TypingIndicator';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import 'katex/dist/katex.min.css';

const preprocessLaTeX = (text) => {
  if (!text) return '';
  return text
    .replace(/\\\[/g, '$$$') 
    .replace(/\\\]/g, '$$$') 
    .replace(/\\\(/g, '$')   
    .replace(/\\\)/g, '$');
};

export default function ChatMessageList({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          Start a conversation with Indra...
        </div>
      )}

      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';

        return (
          <div 
            key={index} 
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                isUser 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 rounded-2xl rounded-br-sm shadow-md' 
                  : 'bg-slate-800/80 text-gray-100 border border-white/5 rounded-2xl rounded-bl-sm shadow-sm backdrop-blur-sm'
              }`}
            >
              {msg.image && (
                <img 
                  src={msg.image} 
                  alt="Uploaded content" 
                  className="max-w-full rounded-lg mb-3 border border-white/10" 
                />
              )}
              
              {msg.text === 'Typing...' ? (
                <TypingIndicator />
              ) : isUser ? (
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
              ) : (
                <div className="break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg my-3 !bg-black/50 border border-white/10"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded-md font-mono text-[0.9em]" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {preprocessLaTeX(msg.text)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}