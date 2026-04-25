'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export default function ChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`/api/chat/history?conversationId=${conversationId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadHistory();
    }
  }, [isOpen, conversationId, loadHistory]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessage = { role: 'assistant', content: '', id: Date.now() + 1 };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantMessage.content += data.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.id === assistantMessage.id) {
                    lastMessage.content = assistantMessage.content;
                  }
                  return newMessages;
                });
              } else if (data.done) {
                setConversationId(data.conversationId);
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        id: Date.now() + 2
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setConversationId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[10000] flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[80vh] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top section */}
            <div className="bg-gradient-to-r from-sky-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] font-semibold text-sky-600 dark:text-sky-300">
                    AI Recommendation
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Talk to Meow
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-[20rem]">
                    Share your mood or preferences and receive nearby sensory-friendly place suggestions.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </button>
              </div>
            </div>

            {/* Chat body */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                {messages.length === 0 ? (
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                    <span className="text-5xl mb-3">🐾</span>
                    <h3 className="text-lg font-semibold">Say something to Meow</h3>
                    <p className="mt-2 text-sm leading-6">
                      Tell Meow how you feel or what kind of place you want.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Meow is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-4">
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">
                    Your message
                  </p>
                  <p className="text-[0.72rem] text-slate-400 dark:text-slate-500">
                    Press Enter to send, Shift+Enter for a new line.
                  </p>
                </div>
                <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}