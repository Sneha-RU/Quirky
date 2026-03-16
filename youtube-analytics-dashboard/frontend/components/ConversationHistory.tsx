"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

interface QueryItem {
  id: string;
  query: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  history: QueryItem[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

export function ConversationHistory({ history, onSelectQuery, onClearHistory }: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Toggle Button (visible when closed) */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed left-4 top-4 z-30 p-3 rounded-full glass-surface border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        aria-label="Open conversation history"
      >
        <MessageSquare size={20} />
      </button>

      {/* Sidebar Panel */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-72 glass-surface border-r border-[var(--color-border-subtle)] z-50 flex flex-col shadow-2xl"
      >
        <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-[var(--color-text-primary)]">
            <MessageSquare size={18} className="text-[var(--color-accent-blue)]" />
            <h2 className="text-callout font-semibold tracking-tight">History</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar">
          {history.length === 0 ? (
            <div className="text-footnote text-[var(--color-text-secondary)] text-center mt-8">
              No recent queries
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    onSelectQuery(item.query);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left p-3 rounded-xl text-footnote transition-all group relative overflow-hidden",
                    i === 0 
                      ? "bg-[var(--color-surface-secondary)] border-l-2 border-[var(--color-accent-blue)] text-[var(--color-text-primary)]" 
                      : "bg-transparent hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <p className="line-clamp-2 leading-relaxed pr-6">{item.query}</p>
                  
                  {/* Subtle hover chevron */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--color-text-secondary)]">
                    <ChevronRight size={14} />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-[var(--color-border-subtle)]">
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg text-footnote text-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)]/10 transition-colors"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
