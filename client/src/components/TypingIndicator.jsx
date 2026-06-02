import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-1 h-6">
      <div 
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        style={{ animationDelay: '0ms', animationDuration: '1s' }}
      ></div>
      <div 
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        style={{ animationDelay: '150ms', animationDuration: '1s' }}
      ></div>
      <div 
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        style={{ animationDelay: '300ms', animationDuration: '1s' }}
      ></div>
    </div>
  );
}